/*
 * Created by: Max
 * Date created: 10.11.2023
 * Modified by: Max
 * Last modified: 03.12.2023
 * Reviewed by:
 * Date Reviewed:
 */

// Skeleton for form loading
const FormSkeleton = () => {
  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-2 mt-5">
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
      <Input />
    </div>
  );
};

export default FormSkeleton;

// Skeleton item for form loading
const Input = () => {
  return <div className="h-10 bg-borderColor mb-3 rounded animate-pulse"></div>;
};
