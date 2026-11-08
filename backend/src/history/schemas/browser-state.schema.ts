import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BrowserStateDocument = HydratedDocument<BrowserState>;

@Schema({ _id: false })
export class HistoryEntry {
  @Prop({
    type: Types.ObjectId,
    ref: 'Site',
    default: null,
  })
  siteId: Types.ObjectId | null;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: Date, default: Date.now })
  visitedAt: Date;

  @Prop({ type: Number, default: 0, min: 0 })
  scrollY: number;

  @Prop({ type: Boolean, default: false })
  isBroken: boolean;
}

export const HistoryEntrySchema =
  SchemaFactory.createForClass(HistoryEntry);

@Schema({ timestamps: true })
export class BrowserState {
  @Prop({
    type: Types.ObjectId,
    ref: 'Person',
    required: true,
    unique: true,
  })
  personId: Types.ObjectId;

  @Prop({
    type: [HistoryEntrySchema],
    default: [],
  })
  entries: HistoryEntry[];

  @Prop({ type: Number, default: -1 })
  currentIndex: number;
}

export const BrowserStateSchema =
  SchemaFactory.createForClass(BrowserState);