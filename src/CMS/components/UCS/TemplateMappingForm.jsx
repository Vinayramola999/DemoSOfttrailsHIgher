import axios from "axios";
import React, { useEffect, useState } from "react";
import MappedData from "./MappedData";
import Swal from "sweetalert2";

const TemplateMappingForm = ({ activeTab, allModules, subTabs, moduleTableNames }) => {
  const [notificationType, setNotificationType] = useState("email");
  const [initialConfig, setInitialConfig] = useState({
    selectedService: "",
    selectedTemplateId: "",
    selectedTemplateName: "",
    variables: [],
    selectedVariables: {},
    customMappedVariables: {},
  });
  const [currentServices, setCurrentServices] = useState([]);
  const [currentTemplates, setCurrentTemplates] = useState([]);
  const [columns, setColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleNotificationTypeChange = (type) => {
    setNotificationType(type);
    // setCurrentServices([]);
    // setCurrentTemplates([]);
    setInitialConfig({
      selectedService: "",
      selectedTemplateId: "",
      selectedTemplateName: "",
      variables: [],
      selectedVariables: {},
      customMappedVariables: {},
    });
  };

  console.warn('INITIAL:', initialConfig);

  const getToken = () => sessionStorage.getItem("token");

  const getColumnNamesByTableName = async () => {
    console.warn('REST:', moduleTableNames);
    const queryParams = moduleTableNames.map((tableName) => `tableName=${tableName}`).join("&");
    const url = `https://devdemo.softtrails.net/ucs/intra/api/modules/columns?${queryParams}`;
    const token = getToken();
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  };

  const handleTemplateChange = async (type, value) => {
    if (!value) {
      setInitialConfig((prev) => ({
        ...prev,
        selectedTemplateId: "",
        selectedTemplateName: "",
        variables: [],
        selectedVariables: {},
        customMappedVariables: {},
      }));
      return;
    }

    setIsLoading(true);
    try {
      // Find based on type
      const selectedTemplate = currentTemplates.find((t) =>
        type === "id" ? t.templateId === value : t.templateName === value
      );


      if (selectedTemplate) {
        const { templateId, templateName } = selectedTemplate;
        const role = notificationType === "email" ? "Email" : "SMS";
        const token = getToken();

        const url = `https://devdemo.softtrails.net/ucs/intra/ucs/getVariables?templateId=${templateId}&Role=${role}`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.warn('RESPONSE:', res.data);

        const columnNames = await getColumnNamesByTableName();
        const cols = Object.entries(columnNames).map(([key, value]) => value);
        console.warn('COLS :', cols);
        const columnData = Object.values(columnNames).filter(value => Array.isArray(value)).flat();
        setColumns(columnData || []);
        setInitialConfig((prev) => ({
          ...prev,
          selectedTemplateId: templateId,
          selectedTemplateName: templateName,
          variables: res.data || [],
          selectedVariables: cols,
          customMappedVariables: {},
        }));
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Fetch Error",
        text: "Could not fetch template variables.",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const getService = async () => {
    try {
      if (moduleTableNames.length === 0) return;
      const token = getToken();
      console.warn('REST:', moduleTableNames);
      const queryParams = moduleTableNames.map((tableName) => `tableName=${tableName}`).join("&");
      const columnsUrl = `https://devdemo.softtrails.net/ucs/intra/api/modules/columns?${queryParams}`;
      const templatesRes = await axios.get(columnsUrl, { headers: { Authorization: `Bearer ${token}` } })
      setColumns(templatesRes.data);
    } catch (error) {
      console.log(error)
    }
  }


  const getAllSms = async () => {
    try {
      const token = getToken();
      const tableDataUrl = "https://devdemo.softtrails.net/ucs/intra/ucs/all";
      const tableDataRes = await axios.get(tableDataUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawData = tableDataRes.data;

      const formattedData = rawData.map((item) => {
        let isValidItem = false;
        let templateId = "N/A";
        let serviceName = "Not mapped";

        if (notificationType === "email") {
          if (item.email) {
            isValidItem = true;
            templateId = item.email;
            serviceName = item.emailService || "Not mapped";
          }
        } else {
          if (item.sms) {
            isValidItem = true;
            templateId = item.sms;
            serviceName = item.smsService || "Not mapped";
          }
        }

        if (!isValidItem) return null;


        const relevantVariables = item.mappedVariables?.filter(v => v.type === (notificationType === "email" ? "Email" : "SMS")) || [];

        const variablesList = relevantVariables.map(v => v.variables);

        const mappedList = relevantVariables.map(v =>
          v.mappedVariables || v.othersMappedVariables || "N/A"
        );

        return {
          serviceName: serviceName,
          templateId: templateId,
          moduleName: item.moduleName,
          notificationType: notificationType === "email" ? "Email" : "SMS",
          variables: variablesList,
          mappedVariables: mappedList
        };
      }).filter(item => item !== null);

      console.warn('Final Table Data:', formattedData);
      setTableData(formattedData);

    } catch (error) {
      console.log(error);
    }
  };



  const getServiceId = async () => {
    try {
      const token = getToken();
      const servicesUrl = notificationType === "email"
        ? "https://devdemo.softtrails.net/ucs/intra/api/email/all"
        : "https://devdemo.softtrails.net/ucs/intra/api/sms/all";
      const servicesRes = await axios.get(servicesUrl, { headers: { Authorization: `Bearer ${token}` } })
      setCurrentServices(servicesRes.data);
    } catch (error) {

    }
  }

  useEffect(() => {
    getService();
    getAllSms();
    // getServiceId(); // Service dropdown currently disabled — skip fetching services

    const fetchInitialData = async () => {
      const token = getToken();
      try {
        const templatesUrl =
          notificationType === "email"
            ? "https://devdemo.softtrails.net/ucs/intra/api/templates/getByRole/Email"
            : "https://devdemo.softtrails.net/ucs/intra/api/templates/getByRole/Sms";

        const res = await axios.get(templatesUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });


        // ✅ Set templates in state
        setCurrentTemplates(res.data);


      } catch (error) {
        console.error("Error fetching initial data for form:", error);
      }
    };

    // if (moduleTableNames && moduleTableNames.length > 0) {
    //   fetchInitialData();
    // }
    fetchInitialData();
  }, [notificationType, moduleTableNames]);

  useEffect(() => {
    console.log("Its Table Data updated:", tableData);
  }, [tableData]);

  const handleSubmit = async () => {
    const typeLabel = notificationType === "email" ? "Email" : "SMS";

    // Basic client-side validation
    /* Service Name validation temporarily disabled — service dropdown/commented out
    if (!initialConfig.selectedService) {
      Swal.fire({ icon: "warning", title: "Missing Field", text: `Please select a Service Name for ${typeLabel}.` });
      return;
    }
    */
    if (!initialConfig.selectedTemplateId) {
      Swal.fire({ icon: "warning", title: "Missing Field", text: `Please select a Template ID or Name for ${typeLabel}.` });
      return;
    }
    for (const variable of initialConfig.variables) {
      const selectedValue = initialConfig.selectedVariables[variable];
      if (!selectedValue) {
        Swal.fire({ icon: "warning", title: "Missing Mapping", text: `Please map the variable "${variable}" for ${typeLabel}.` });
        return;
      }
      if (selectedValue === 'other' && !initialConfig.customMappedVariables[variable]?.trim()) {
        Swal.fire({ icon: "warning", title: "Missing Custom Value", text: `Please enter a custom value for "${variable}" for ${typeLabel}.` });
        return;
      }
    }

    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) {
        console.error('No auth token found in sessionStorage.');
        Swal.fire({ icon: 'warning', title: 'Authentication Error', text: 'Session expired or not logged in. Please login again.' });
        return;
      }
      console.warn("All modules:", allModules);
      const url = "https://devdemo.softtrails.net/ucs/intra/ucs/mappedVariables";
      const type = notificationType === "email" ? "Email" : "SMS";
      const moduleInfo = allModules.find((m) => m.subModuleName === activeTab);

      if (!moduleInfo) {
        console.error("Could not find a matching module in allModules for activeTab:", activeTab);
        Swal.fire({ icon: "error", title: "Configuration Error", text: "Could not determine module details. Please check data configuration." });
        return;
      }

      const moduleName = moduleInfo.uniqueIdentifierName;

      const variableMappings = initialConfig.variables.map((variable) => {
        const selectedValue = initialConfig.selectedVariables[variable];
        return selectedValue === "other"
          ? { variables: variable, otherMappedVariables: initialConfig.customMappedVariables[variable] || "" }
          : { variables: variable, mappedVariables: selectedValue || "" };
      });

      const payload = {
        moduleName,
        type,
        variableMappings,
      };

      if (type === "Email") {
        payload.Email = initialConfig.selectedTemplateId;
        // payload.emailService = initialConfig.selectedService; // Service field disabled
      } else {
        payload.SMS = initialConfig.selectedTemplateId;
        // payload.smsService = initialConfig.selectedService; // Service field disabled
      }

      console.log('Submitting mapping payload to', url, { payload });

      const res = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Submission response:', res && res.data);

      // Show backend message if provided (e.g. "Module updated successfully.")
      let successMessage = 'Template Mapped Successfully!';
      if (res && res.data) {
        if (typeof res.data === 'string') successMessage = res.data;
        else if (res.data.message) successMessage = res.data.message;
        else if (res.data.msg) successMessage = res.data.msg;
      }

      await getAllSms();
      setInitialConfig({
        selectedTemplateId: "",
        selectedTemplateName: "",
        selectedService: "",
        variables: [],
        selectedVariables: {},
        customMappedVariables: {},
      });
      Swal.fire({ icon: "success", title: "Success", text: successMessage });
    } catch (error) {
      console.error("Error during submission:", error);
      // Prefer backend-provided message when available
      const serverMsg = error?.response?.data?.message || error?.response?.data || error?.message;
      Swal.fire({ icon: "error", title: "Submission Failed", text: serverMsg || "An error occurred during submission." });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    console.log("Table Data updated:", tableData);
  }, [tableData]);

  console.log('Passing tableData to MappedData:', tableData.length, tableData);

  return (
    <div className="pb-6">
      {/* Toggling between SMS and Email */}
      <div className="flex gap-6 mb-3 mt-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="notificationType" value="email" checked={notificationType === "email"} onChange={() => handleNotificationTypeChange("email")} className="form-radio text-blue-600 h-4 w-4" />
          <span className="text-sm font-medium text-gray-700">Email</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="notificationType" value="sms" checked={notificationType === "sms"} onChange={() => handleNotificationTypeChange("sms")} className="form-radio text-blue-600 h-4 w-4" />
          <span className="text-sm font-medium text-gray-700">SMS</span>
        </label>
      </div>

      {/* Mapping forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- Email Section --- */}
        <div className={`p-4 border rounded-md transition-opacity duration-300 ${notificationType === "email" ? "bg-blue-50 border-blue-400 opacity-100" : "opacity-50 pointer-events-none border-gray-200"}`}>
          <h3 className="text-md font-semibold text-blue-700 mb-3">Email Notification</h3>

          {/* Service Name */}
          { /* Service Name dropdown temporarily disabled
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={notificationType === "email" ? initialConfig.selectedService : ""}
              onChange={(e) => setInitialConfig((prev) => ({ ...prev, selectedService: e.target.value }))}
              disabled={notificationType !== "email" || isLoading}
            >
              <option value="">Select Service Name</option>
              {currentServices.map((service) => (
                <option key={`email-serv-${service.serviceId || service.serviceName}`} value={service.serviceName}>
                  {service.serviceName}
                </option>
              ))}
            </select>
          </div>
          */ }

          {/* Template ID & Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template ID</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={notificationType === "email" ? initialConfig.selectedTemplateId : ""}
                onChange={(e) => handleTemplateChange("id", e.target.value)}
                disabled={notificationType !== "email" || isLoading}
              >
                <option value="">Select Template ID</option>
                {currentTemplates.map((template) => (
                  <option key={`email-id-${template.templateId}`} value={template.templateId}>
                    {template.templateId}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={notificationType === "email" ? initialConfig.selectedTemplateName : ""}
                onChange={(e) => handleTemplateChange("name", e.target.value)}
                disabled={notificationType !== "email" || isLoading}
              >
                <option value="">Select Template Name</option>
                {currentTemplates.map((template) => (
                  <option key={`email-name-${template.templateId}`} value={template.templateName}>
                    {template.templateName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Variable Mapping */}
          {initialConfig.variables.length > 0 && notificationType === "email" && (
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2 mt-3 border-t pt-3">Map Template Variables</h4>
              <div className="flex flex-wrap gap-4">
                {initialConfig.variables.map((variable, idx) => (
                  <div
                    key={`email-var-${idx}`}
                    className="w-full sm:w-auto flex-1 min-w-[150px]"
                  >
                    {/* Variable label */}
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      {variable}
                    </label>

                    {/* Dropdown */}
                    <select
                      className="w-full border border-gray-300 rounded-md p-2 text-sm mb-1"
                      value={initialConfig.selectedVariables[variable] || ""}
                      onChange={(e) =>
                        setInitialConfig((prev) => ({
                          ...prev,
                          selectedVariables: {
                            ...prev.selectedVariables,
                            [variable]: e.target.value,
                          },
                        }))
                      }
                      disabled={notificationType !== "email"}
                    >
                      <option value="">Select Column or Other</option>

                      {/* 🔥 Yaha columns ka loop hoga har variable ke liye */}
                      {Array.isArray(columns) &&
                        columns.map((col, i) => (
                          <option key={`email-col-${i}`} value={col}>
                            {col}
                          </option>
                        ))}

                      <option value="other">Other (Custom Input)</option>
                    </select>

                    {/* Custom input agar "Other" select kare */}
                    {initialConfig.selectedVariables[variable] === "other" && (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 text-sm mt-1"
                        placeholder="Enter custom value"
                        onChange={(e) =>
                          setInitialConfig((prev) => ({
                            ...prev,
                            customMappedVariables: {
                              ...prev.customMappedVariables,
                              [variable]: e.target.value,
                            },
                          }))
                        }
                        value={initialConfig.customMappedVariables[variable] || ""}
                        disabled={notificationType !== "email"}
                      />
                    )}
                  </div>
                ))}

              </div>
            </div>
          )}
        </div>

        {/* --- SMS Section --- */}
        <div className={`p-4 border rounded-md transition-opacity duration-300 ${notificationType === "sms" ? "bg-blue-50 border-blue-400 opacity-100" : "opacity-50 pointer-events-none border-gray-200"}`}>
          <h3 className="text-md font-semibold text-blue-700 mb-3">SMS Notification</h3>

          {/* Service Name */}
          { /* Service Name dropdown temporarily disabled
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              value={notificationType === "sms" ? initialConfig.selectedService : ""}
              onChange={(e) => setInitialConfig((prev) => ({ ...prev, selectedService: e.target.value }))}
              disabled={notificationType !== "sms" || isLoading}
            >
              <option value="">Select Service Name</option>
              {currentServices.map((service) => (
                <option key={`sms-serv-${service.serviceId || service.serviceName}`} value={service.serviceName}>
                  {service.serviceName}
                </option>
              ))}
            </select>
          </div>
          */ }

          {/* Template ID & Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template ID</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={notificationType === "sms" ? initialConfig.selectedTemplateId : ""}
                onChange={(e) => handleTemplateChange("id", e.target.value)}
                disabled={notificationType !== "sms" || isLoading}
              >
                <option value="">Select Template ID</option>
                {currentTemplates.map((template) => (
                  <option key={`sms-id-${template.templateId}`} value={template.templateId}>
                    {template.templateId}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <select
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
                value={notificationType === "sms" ? initialConfig.selectedTemplateName : ""}
                onChange={(e) => handleTemplateChange("name", e.target.value)}
                disabled={notificationType !== "sms" || isLoading}
              >
                <option value="">Select Template Name</option>
                {currentTemplates.map((template) => (
                  <option key={`sms-name-${template.templateId}`} value={template.templateName}>
                    {template.templateName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Variable Mapping */}
          {initialConfig.variables.length > 0 && notificationType === "sms" && (
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2 mt-3 border-t pt-3">Map Template Variables</h4>
              <div className="flex flex-wrap gap-4">
                {initialConfig.variables.map((variable, idx) => (

                  <div key={`sms-var-${idx}`} className="w-full sm:w-auto flex-1 min-w-[150px]">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">{variable}</label>
                    <select
                      className="w-full border border-gray-300 rounded-md p-2 text-sm mb-1"
                      value={initialConfig.selectedVariables[variable] || ""}
                      onChange={(e) => setInitialConfig((prev) => ({
                        ...prev,
                        selectedVariables: { ...prev.selectedVariables, [variable]: e.target.value },
                      }))}
                      disabled={notificationType !== "sms"}
                    >
                      <option value="">Select Column or Other</option>
                      {Array.isArray(columns) && columns.map((col, i) => (
                        <option key={`sms-col-${i}`} value={col}>{col}</option>
                      ))}
                      <option value="other">Other (Custom Input)</option>
                    </select>
                    {initialConfig.selectedVariables[variable] === "other" && (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md p-2 text-sm mt-1"
                        placeholder="Enter custom value"
                        onChange={(e) => setInitialConfig((prev) => ({
                          ...prev,
                          customMappedVariables: { ...prev.customMappedVariables, [variable]: e.target.value },
                        }))}
                        value={initialConfig.customMappedVariables[variable] || ""}
                        disabled={notificationType !== "sms"}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
      <div className="w-full flex justify-center mb-6">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`bg-blue-500 px-4 py-2 rounded-md text-white my-4 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
        >
          {isLoading ? 'Loading...' : 'Submit'}
        </button>

      </div>
      <MappedData data={tableData} />
    </div>
  );
};

export default TemplateMappingForm;