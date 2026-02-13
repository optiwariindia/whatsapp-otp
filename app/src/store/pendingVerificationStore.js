export class PendingVerificationStore {
  constructor() {
    this.byRequestId = new Map();
    this.byPhone = new Map();
  }

  upsert(record) {
    this.byRequestId.set(record.requestId, record);
    const ids = this.byPhone.get(record.visitorPhoneE164) || new Set();
    ids.add(record.requestId);
    this.byPhone.set(record.visitorPhoneE164, ids);
  }

  getByPhone(phone) {
    const ids = this.byPhone.get(phone);
    if (!ids) return [];

    return [...ids]
      .map((id) => this.byRequestId.get(id))
      .filter(Boolean)
      .filter((record) => record.status === 'PENDING')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  complete(record, status, reason = null, otpReceived = null) {
    const updated = {
      ...record,
      status,
      reason,
      otpReceived,
      updatedAt: new Date().toISOString(),
    };

    this.byRequestId.set(record.requestId, updated);

    const ids = this.byPhone.get(record.visitorPhoneE164);
    if (ids) {
      ids.delete(record.requestId);
      if (!ids.size) this.byPhone.delete(record.visitorPhoneE164);
    }

    return updated;
  }

  cleanupExpired() {
    const now = Date.now();
    for (const record of this.byRequestId.values()) {
      if (record.status !== 'PENDING') continue;
      if (new Date(record.expiresAt).getTime() < now) {
        this.complete(record, 'EXPIRED', 'OTP_EXPIRED');
      }
    }
  }
}
