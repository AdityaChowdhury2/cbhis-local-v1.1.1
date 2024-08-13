import SaveAndBackButtons from "../core/buttons/SaveAndBackButtons";
import Input from "../core/form-elements/Input";
import Textarea from "../core/form-elements/Textarea";

const DeviceForm = ({
  handleSubmit,
  inputError,
  formData,
  handleFormChange,
  toggler,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="">
        <div className="flex flex-col gap-3">
          <Input
            label="IMEINumber"
            name="imeiNumber"
            errMsg={inputError?.imeiNumber}
            value={formData?.imeiNumber}
            onChange={handleFormChange}
            required
          />

          <Textarea
            label="Description"
            name="description"
            errMsg={inputError?.description}
            value={formData?.description}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="mt-5 col-span-full">
          <SaveAndBackButtons submitBtnText="Save" toggler={toggler} />
        </div>
      </div>
    </form>
  );
};

export default DeviceForm;
