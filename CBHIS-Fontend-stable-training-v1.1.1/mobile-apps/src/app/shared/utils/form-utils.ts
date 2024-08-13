export function addCommonFields(form: any, user: any) {
  form.createdBy = user?.id?.toString();
  form.dateCreated = new Date().toISOString();
  form.isSynced = 0;
  form.isDeleted = 0;
  return form;
}
