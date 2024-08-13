export interface BaseEntity {
  id?: number;
  createdby?: string;
  datecreated?: string;
  modifiedby?: string;
  datemodified?: string;
  isdeleted?: number;
  issynced?: number;
  onlinedboid?: string;
}
