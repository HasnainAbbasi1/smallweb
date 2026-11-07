import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SiteDocument = HydratedDocument<Site>;

@Schema({ timestamps: true })
export class Site {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  address: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, type: String })
  html: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Person',
    required: true,
  })
  authorId: Types.ObjectId;
}

export const SiteSchema = SchemaFactory.createForClass(Site);