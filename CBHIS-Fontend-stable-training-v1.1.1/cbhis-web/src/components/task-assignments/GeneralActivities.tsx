import DateInput from "../core/form-elements/DatePicker";
import Select from "../core/form-elements/Select";
import Textarea from "../core/form-elements/Textarea";

type Props = {};

const GeneralActivities = ({}: Props) => {
  return (
    <div className="bg-whiteColor rounded-lg p-5 my-5">
      <form>
        <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
          <Select label="Select RHM" required>
            <option value=""></option>
          </Select>
          <DateInput label="Appointment date" onChange={() => {}} required />
          <Select label="Select priority" required>
            <option value=""></option>
          </Select>
          <div className="md:col-span-full">
            <Textarea label="Appointment details" className="h-24" />
          </div>
        </div>
        <button className="main_btn mt-5">Submit</button>
      </form>
    </div>
  );
};

export default GeneralActivities;
