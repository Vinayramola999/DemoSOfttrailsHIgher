import React from "react";
import Select from "react-select";

const CustomerFormModal = ({
  isOpen,
  isEditMode,
  newCustomer,
  onChange,
  onmobileChange,
  onEmailChange,
  onInputChange,
  onSubmit,
  onClose,
  errorMessage,
  mobileError,
  emailError,
  gstError,
  panError,
  handleCountryChange,
  handleStateChange,
  handleCityChange,
  Country,
  State,
  City,
}) => {
  if (!isOpen) return null;

  // Convert data for react-select
  const countryOptions = Country.getAllCountries().map((country) => ({
    value: country.name,
    label: country.name,
    isoCode: country.isoCode,
  }));

  const stateOptions =
    newCustomer.country &&
    State.getStatesOfCountry(
      Country.getAllCountries().find((c) => c.name === newCustomer.country)
        ?.isoCode
    ).map((state) => ({
      value: state.name,
      label: state.name,
      isoCode: state.isoCode,
    }));

  const cityOptions =
    newCustomer.state &&
    City.getCitiesOfState(
      Country.getAllCountries().find((c) => c.name === newCustomer.country)
        ?.isoCode,
      State.getStatesOfCountry(
        Country.getAllCountries().find((c) => c.name === newCustomer.country)
          ?.isoCode
      ).find((s) => s.name === newCustomer.state)?.isoCode
    ).map((city) => ({
      value: city.name,
      label: city.name,
    }));

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-5 rounded-2xl w-[55%] max-h-[100vh] overflow-auto scrollbar-hide relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold mb-2 ml-7">
            {isEditMode ? "Edit Customer" : "Add Customer"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 w-full">
          <div className="ml-4 sm:ml-7">
            {/* Customer Name & Phone */}
            <div className="grid gap-4 mb-2 md:grid-cols-2">
              <div className="flex flex-col">
                <label className="text-[10px] sm:text-base">
                  Customer Name: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={newCustomer.customer_name}
                  onChange={onChange}
                  placeholder="Enter Customer Name"
                  className="p-1 sm:p-2 border border-black rounded text-sm sm:text-base"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm sm:text-base">
                  Phone Number: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone_number"
                  value={newCustomer.phone_number}
                  onChange={onmobileChange}
                  placeholder="Enter mobile number"
                  className="p-1 sm:p-2 border border-black rounded text-sm sm:text-base"
                />
                {mobileError && (
                  <p className="text-red-500 text-[10px] sm:text-sm mt-1">
                    {mobileError}
                  </p>
                )}
              </div>
            </div>

            {/* Email & Industry */}
            <div className="grid gap-4 mb-2 md:grid-cols-2">
              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">
                  E-mail: <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email_id"
                  value={newCustomer.email_id}
                  onChange={onEmailChange}
                  placeholder="Enter Email"
                  className={`p-1 sm:p-2 border ${
                    emailError ? "border-red-500" : "border-black"
                  } rounded text-sm sm:text-base`}
                />
                {emailError && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {emailError}
                  </p>
                )}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">Industry:</label>
                <input
                  type="text"
                  name="industry"
                  value={newCustomer.industry || ""}
                  onChange={onChange}
                  placeholder="Enter Industry"
                  className="p-1 sm:p-2 border border-black rounded text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Address, Country & State in same row */}
            <div className="grid gap-4 mb-2 md:grid-cols-3">
              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">Address:</label>
                <input
                  type="text"
                  name="address"
                  value={newCustomer.address}
                  onChange={onChange}
                  placeholder="Enter Address"
                  className="p-1 sm:p-2 border border-black rounded text-sm sm:text-base"
                />
              </div>

              {/* Country Dropdown */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">Country:</label>
                <Select
                  options={countryOptions}
                  value={
                    newCustomer.country
                      ? { value: newCustomer.country, label: newCustomer.country }
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

              {/* State Dropdown beside Country */}
              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">State:</label>
                <Select
                  options={stateOptions || []}
                  value={
                    newCustomer.state
                      ? { value: newCustomer.state, label: newCustomer.state }
                      : null
                  }
                  onChange={(selected) =>
                    handleStateChange({
                      target: { name: "state", value: selected?.value },
                    })
                  }
                  placeholder="Select State"
                  isDisabled={!newCustomer.country}
                  isSearchable
                />
              </div>
            </div>

            {/* City & Pincode */}
            <div className="grid gap-4 mb-2 md:grid-cols-2">
              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">City:</label>
                <Select
                  options={cityOptions || []}
                  value={
                    newCustomer.city
                      ? { value: newCustomer.city, label: newCustomer.city }
                      : null
                  }
                  onChange={(selected) =>
                    handleCityChange({
                      target: { name: "city", value: selected?.value },
                    })
                  }
                  placeholder="Select City"
                  isDisabled={!newCustomer.state}
                  isSearchable
                />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">Pincode:</label>
                <input
                  type="text"
                  name="pincode"
                  value={newCustomer.pincode}
                  onChange={onInputChange}
                  placeholder="Enter Pincode"
                  className="p-1 sm:p-2 border border-black rounded text-sm sm:text-base"
                />
              </div>
            </div>

            {/* GST, PAN, TAN */}
            <div className="grid gap-4 mb-2 md:grid-cols-3">
              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">GST Number:</label>
                <input
                  type="text"
                  name="gst_number"
                  value={newCustomer.gst_number}
                  onChange={onChange}
                  placeholder="Enter GST number"
                  className="p-1 sm:p-2 border border-black rounded text-sm sm:text-base"
                />
                {gstError && <p className="text-red-500 text-sm">{gstError}</p>}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">PAN Number:</label>
                <input
                  type="text"
                  name="pan_no"
                  value={newCustomer.pan_no}
                  onChange={onChange}
                  placeholder="Enter PAN number"
                  className="p-1 sm:p-2 border border-black rounded text-sm sm:text-base"
                />
                {panError && <p className="text-red-500 text-sm">{panError}</p>}
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm sm:text-base">TAN Number:</label>
                <input
                  type="text"
                  name="tan_number"
                  value={newCustomer.tan_number}
                  onChange={onChange}
                  placeholder="Enter TAN number"
                  className="p-1 sm:p-2 border border-black rounded text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Status - only edit mode */}
            {isEditMode && (
              <div className="flex flex-col mb-3">
                <label className="mb-2 text-sm sm:text-base">Status:</label>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={newCustomer.status === "active"}
                    onChange={onChange}
                    className="mr-2"
                    id="status-active"
                  />
                  <label htmlFor="status-active" className="mr-4 cursor-pointer">
                    Active
                  </label>
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={newCustomer.status === "inactive"}
                    onChange={onChange}
                    className="mr-2"
                    id="status-inactive"
                  />
                  <label htmlFor="status-inactive" className="cursor-pointer">
                    Inactive
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="ml-4 sm:ml-7 mt-2">
            <div className="flex">
              <button
                type="submit"
                className="w-64 px-4 py-2 bg-[#005BE7] text-white rounded"
              >
                {isEditMode ? "Update" : "Submit For Approval"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-64 mx-4 px-4 py-2 bg-white text-black border border-black"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {errorMessage && (
          <div className="border-red-400 text-red-700 px-4 py-3 rounded-2xl mt-4">
            <strong className="font-bold">Message:</strong>
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerFormModal;
