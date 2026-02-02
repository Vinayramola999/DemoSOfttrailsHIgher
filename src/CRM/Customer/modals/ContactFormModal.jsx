import React from "react";
import Select from "react-select";

const ContactFormModal = ({
  isOpen,
  isEditMode,
  contact,
  onChange,
  onSubmit,
  onClose,
  errorMessage,
  handleCountryChange,
  handleStateChange,
  handleCityChange,
  Country,
  State,
  City,
}) => {
  if (!isOpen) return null;

  // Convert data for react-select
  const countryOptions = Country ? Country.getAllCountries().map((country) => ({
    value: country.name,
    label: country.name,
    isoCode: country.isoCode,
  })) : [];

  const stateOptions =
    contact.country && State && Country ?
      State.getStatesOfCountry(
        Country.getAllCountries().find((c) => c.name === contact.country)
          ?.isoCode
      ).map((state) => ({
        value: state.name,
        label: state.name,
        isoCode: state.isoCode,
      })) : [];

  const cityOptions =
    contact.state && City && Country && State ?
      City.getCitiesOfState(
        Country.getAllCountries().find((c) => c.name === contact.country)
          ?.isoCode,
        State.getStatesOfCountry(
          Country.getAllCountries().find((c) => c.name === contact.country)
            ?.isoCode
        ).find((s) => s.name === contact.state)?.isoCode
      ).map((city) => ({
        value: city.name,
        label: city.name,
      })) : [];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-5 rounded-2xl w-[55%] max-h-[100vh] overflow-auto relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold mb-2 ml-7">
            {isEditMode ? "Edit Contact" : "Create Contact"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="red"
              className="size-8"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 w-full">
          <div className="ml-4 sm:ml-7">
            <div className="grid gap-4 mb-2 md:grid-cols-3">
              <div className="flex flex-col">
                <label className="text-[10px] sm:text-base">
                  Contact Person: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={contact.contact_person}
                  onChange={onChange}
                  placeholder="Enter Contact Person Name"
                  // required
                  className="p-1 sm:p-2 border border-black rounded text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">
                  Phone: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone_num"
                  value={contact.phone_num}
                  onChange={onChange}
                  placeholder="Enter Phone number"
                  // required
                  className="p-1 sm:p-2 border border-black rounded text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">
                  E-mail: <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email_id"
                  value={contact.email_id}
                  onChange={onChange}
                  placeholder="Enter Email"
                  className="p-1 sm:p-2 border border-black rounded text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="grid gap-4 mb-2 md:grid-cols-3">
              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">Address:</label>
                <input
                  type="text"
                  name="address"
                  value={contact.address}
                  onChange={onChange}
                  placeholder="Enter Address"
                  className="p-1 sm:p-2 border border-black rounded text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">Country:</label>
                <Select
                  options={countryOptions}
                  value={
                    contact.country
                      ? { value: contact.country, label: contact.country }
                      : null
                  }
                  onChange={(selected) =>
                    handleCountryChange({
                      target: { name: "country", value: selected?.value },
                    })
                  }
                  placeholder="Select Country"
                  isSearchable
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">State:</label>
                <Select
                  options={stateOptions}
                  value={
                    contact.state
                      ? { value: contact.state, label: contact.state }
                      : null
                  }
                  onChange={(selected) =>
                    handleStateChange({
                      target: { name: "state", value: selected?.value },
                    })
                  }
                  placeholder="Select State"
                  isDisabled={!contact.country}
                  isSearchable
                />
              </div>
            </div>
            <div className="grid gap-4 mb-2 md:grid-cols-3">
              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">City:</label>
                <Select
                  options={cityOptions}
                  value={
                    contact.city
                      ? { value: contact.city, label: contact.city }
                      : null
                  }
                  onChange={(selected) =>
                    handleCityChange({
                      target: { name: "city", value: selected?.value },
                    })
                  }
                  placeholder="Select City"
                  isDisabled={!contact.state}
                  isSearchable
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">Pincode:</label>
                <input
                  type="text"
                  name="pincode"
                  value={contact.pincode}
                  onChange={onChange}
                  placeholder="Enter Pincode"
                  className="p-1 sm:p-2 border border-black rounded text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">Department:</label>
                <input
                  type="text"
                  name="department"
                  value={contact.department}
                  onChange={onChange}
                  placeholder="Enter Department"
                  className="p-1 sm:p-2 border border-black rounded text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="grid gap-4 mb-2 md:grid-cols-3">
              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">Designation:</label>
                <input
                  type="text"
                  name="designation"
                  value={contact.designation}
                  onChange={onChange}
                  placeholder="Enter Designation"
                  className="p-1 sm:p-2 border border-black rounded text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">Date of Start:</label>
                <input
                  type="date"
                  name="date_of_start"
                  value={contact.date_of_start}
                  onChange={onChange}
                  className="p-1 sm:p-2 border border-black rounded text-sm sm:text-base"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">Date of End:</label>
                <input
                  type="date"
                  name="date_of_end"
                  value={contact.date_of_end}
                  onChange={onChange}
                  className="p-1 sm:p-2 border border-black rounded text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex flex-col mb-3">
              <label className="mb-2 text-sm sm:text-base">Status:</label>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={contact.status === "active"}
                  onChange={onChange}
                  className="mr-2"
                />
                <label className="mr-4">Active</label>
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={contact.status === "inactive"}
                  onChange={onChange}
                  className="mr-2"
                />
                <label>Inactive</label>
              </div>
            </div>
          </div>
          <div className="ml-4 sm:ml-7">
            <div className="flex items-end col-span-2 mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-[#005BE7] text-white w-[200px] border-2 border-[#005BE7] rounded mr-2 
              "
              >
                {isEditMode ? "Save Changes" : "Add Contact"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white text-black w-[200px] border-2 border-black rounded mr-2"
              >
                Cancel
              </button>
            </div>
          </div>
          {errorMessage && (
            <div className="text-red-500 px-4 py-3 rounded relative">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContactFormModal;