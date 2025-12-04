// Item & Demand Status
// Backend: draft/pending/active/off/deleted
export enum ItemStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    ACTIVE = 'active',
    OFF = 'off',
    DELETED = 'deleted'
}

export enum DemandStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    ACTIVE = 'active',
    OFF = 'off',
    DELETED = 'deleted'
}

// Offer Status
// Backend: created/accepted/rejected/canceled
export enum OfferStatus {
    CREATED = 'created',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    CANCELED = 'canceled'
}

// Order Status
// Backend: created/paid/canceled/completed
export enum OrderStatus {
    CREATED = 'created',
    PAID = 'paid',
    CANCELED = 'canceled',
    COMPLETED = 'completed'
}

// Message Status
// Backend: active/recalled/deleted
export enum MessageStatus {
    ACTIVE = 'active',
    RECALLED = 'recalled',
    DELETED = 'deleted'
}

// Notification Status
// Backend: active/archived/deleted
export enum NotificationStatus {
    ACTIVE = 'active',
    ARCHIVED = 'archived',
    DELETED = 'deleted'
}
