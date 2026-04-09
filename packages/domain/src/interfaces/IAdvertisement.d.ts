import { AdStatus, MediaType } from "../enums";
/**
 * Advertisement entity interface
 * Represents a digital advertisement (image or video)
 */
export interface IAdvertisement {
    id: string;
    adId: string;
    advertiserId: string;
    adName: string;
    mediaUrl: string;
    mediaType: MediaType;
    thumbnailUrl?: string | undefined;
    duration: number;
    description?: string | undefined;
    status: AdStatus;
    targetAudience?: string | undefined;
    fileSize?: number | undefined;
    views: number;
    clicks: number;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=IAdvertisement.d.ts.map