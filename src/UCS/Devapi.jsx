import React, { useState, useEffect } from 'react';

const Devapi = () => {
  // State to hold all the data from the API for modules
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [errorModules, setErrorModules] = useState(null);

  // State for the selected values in each dropdown
  const [selectedApp, setSelectedApp] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedSubModule, setSelectedSubModule] = useState('');

  // New states for Message Name dropdown and related data
  // ✅ FIX: Renamed from messageData to messageTemplates for clarity
  const [messageTemplates, setMessageTemplates] = useState([]); 
  const [loadingMessageTemplates, setLoadingMessageTemplates] = useState(false); // Start as false
  const [errorMessageTemplates, setErrorMessageTemplates] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // States for JSON body parameters
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  // To store values for dynamic variables from message
  const [variableValues, setVariableValues] = useState({});

  // New state for radio button selection (Email/SMS)
  const [selectedMessageType, setSelectedMessageType] = useState('Email'); // default is Email

  // Helper function to extract variables from the message string
  const extractVariablesFromMessage = (messageString) => {
    if (!messageString) return [];
    const regex = /{#var#}/g; // Matches all occurrences of {#var#}
    const matches = [...messageString.matchAll(regex)];

    // Since mappedVariables are not in this API response, we generate generic names
    return matches.map((_, index) => ({
      variable: `var${index + 1}`,
      mappedVariable: `Variable ${index + 1}` // Displayed name
    }));
  };

  const selectedIdentifier = (selectedApp && selectedModule)
    ? modules.find(item =>
        item.applicationName === selectedApp &&
        item.moduleName === selectedModule
      )?.uniqueIdentifierName
    : '';

  // Fetch data from the modules API when the component mounts
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from localStorage
        const response = await fetch('https://ucsdemo.softtrails.net/api/modules', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setModules(data);
      } catch (e) {
        setErrorModules(e.message);
        console.error("Failed to fetch modules:", e);
      } finally {
        setLoadingModules(false);
      }
    };
    fetchModules();
  }, []);

  // --- Derived data for dropdowns ---
  const applicationNames = [...new Set(modules.map(item => item.applicationName))];
  const moduleNames = selectedApp
    ? [...new Set(modules.filter(item => item.applicationName === selectedApp).map(item => item.moduleName))]
    : [];
  const subModuleNames = (selectedApp && selectedModule)
    ? modules.filter(item => item.applicationName === selectedApp && item.moduleName === selectedModule).map(item => item.subModuleName)
    : [];

  // ✅ BIG CHANGE: Fetch message templates based on RADIO BUTTON selection (Email/SMS)
  useEffect(() => {
    const fetchMessageTemplates = async () => {
      // If no message type is selected, do nothing.
      if (!selectedMessageType) {
        setMessageTemplates([]);
        setSelectedTemplate(null);
        return;
      }

      setLoadingMessageTemplates(true);
      setErrorMessageTemplates(null);
      setSelectedTemplate(null); // Reset selected template
      setVariableValues({});    // Reset variables

      try {
        // Use the selectedMessageType to build the API URL
        const token = localStorage.getItem('token'); // Get token from localStorage
        const response = await fetch(`https://ucsdemo.softtrails.net/api/templates/getByRole/${selectedMessageType.toLowerCase()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // ✅ FIX: The API returns a direct array, so we set it directly.
        setMessageTemplates(data);
      } catch (e) {
        setErrorMessageTemplates(e.message);
        console.error("Failed to fetch message templates:", e);
        setMessageTemplates([]); // Clear data on error
      } finally {
        setLoadingMessageTemplates(false);
      }
    };

    fetchMessageTemplates();
  }, [selectedMessageType]); // ✅ KEY CHANGE: Dependency is now the radio button state

  // Get variables from the *selected template's message string*
  const variablesForSelectedTemplate = selectedTemplate
    ? extractVariablesFromMessage(selectedTemplate.message)
    : [];

  // --- Event Handlers ---

  const handleAppChange = (e) => {
    setSelectedApp(e.target.value);
    setSelectedModule('');
    setSelectedSubModule('');
  };

  const handleModuleChange = (e) => {
    setSelectedModule(e.target.value);
    setSelectedSubModule('');
  };

  const handleSubModuleChange = (e) => {
    setSelectedSubModule(e.target.value);
  };
  
  // ✅ FIX: Updated to work with the new `messageTemplates` state
  const handleTemplateChange = (e) => {
    const selectedTemplateId = e.target.value;
    // Find the template from our state which is a direct array now
    const template = messageTemplates.find(t => t.templateId === selectedTemplateId);
    setSelectedTemplate(template || null);
    setVariableValues({});
  };

  const handleVariableValueChange = (variableName, value) => {
    setVariableValues(prevValues => ({
      ...prevValues,
      [variableName]: value,
    }));
  };

  const handleMessageTypeChange = (e) => {
    const newMessageType = e.target.value;
    setSelectedMessageType(newMessageType);
    // When type changes, reset everything below it
    setSelectedTemplate(null);
    setVariableValues({});
    if (newMessageType === 'Email') {
      setMobileNumber('');
    } else if (newMessageType === 'SMS') {
      setEmailAddress('');
    }
  };

  // Construct the JSON body dynamically
  const requestJsonBody = {
    template_id: selectedTemplate ? selectedTemplate.templateId : "", // Add template_id to the body
    variables_values: Object.entries(variableValues)
      .filter(([, value]) => value !== '')
      .map(([key, value]) => `${key}:${value}`)
      .join(', '),
    ...(selectedMessageType === 'Email' ? { email_address: emailAddress } : {}),
    ...(selectedMessageType === 'SMS' ? { numbers: mobileNumber } : {}),
    unique_identifier: selectedIdentifier
  };

  if (loadingModules) {
    return <div className="p-6">Loading Module data...</div>;
  }
  if (errorModules) {
    return <div className="p-6 text-red-500">Error loading modules: {errorModules}</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-100 md:items-stretch">
      {/* Left Side Form */}
      <div className="bg-white shadow-md rounded-lg p-4 w-full md:w-1/2 space-y-2 overflow-y-auto max-h-[calc(100vh-48px)]">
        {/* Module Selection remains the same */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Method</label>
          <select className="w-full border border-gray-300 rounded px-3 py-2" value="POST" readOnly disabled>
            <option value="POST">POST</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Application Name</label>
          <select value={selectedApp} onChange={handleAppChange} className="w-full border border-gray-300 rounded px-3 py-2">
            <option value="">Select Application</option>
            {applicationNames.map(name => (<option key={name} value={name}>{name}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Module Name</label>
          <select value={selectedModule} onChange={handleModuleChange} className="w-full border border-gray-300 rounded px-3 py-2" disabled={!selectedApp}>
            <option value="">Select Module</option>
            {moduleNames.map(name => (<option key={name} value={name}>{name}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Sub Module Name</label>
          <select value={selectedSubModule} onChange={handleSubModuleChange} className="w-full border border-gray-300 rounded px-3 py-2" disabled={!selectedModule}>
            <option value="">Select Sub Module</option>
            {subModuleNames.map(name => (<option key={name} value={name}>{name}</option>))}
          </select>
        </div>

        {/* Radio Buttons for Message Type */}
        <div className="mt-4">
          <label className="block text-gray-700 font-medium mb-1">Message Type</label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input type="radio" className="form-radio text-indigo-600" name="messageType" value="Email" checked={selectedMessageType === 'Email'} onChange={handleMessageTypeChange} />
              <span className="ml-2 text-gray-700">Email</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" className="form-radio text-indigo-600" name="messageType" value="SMS" checked={selectedMessageType === 'SMS'} onChange={handleMessageTypeChange} />
              <span className="ml-2 text-gray-700">SMS</span>
            </label>
          </div>
        </div>

        {/* Message Name Dropdown */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Message Name</label>
          <select
            value={selectedTemplate ? selectedTemplate.templateId : ''}
            onChange={handleTemplateChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            // ✅ FIX: Disabled logic is now simpler
            disabled={loadingMessageTemplates || !selectedMessageType}
          >
            <option value="">Select Message</option>
            {/* ✅ FIX: Mapping over messageTemplates directly */}
            {messageTemplates.map(template => (
              // Use templateName for a cleaner dropdown, or template.message for the full text
              <option key={template.id} value={template.templateId}>
                {template.templateName} ({template.message.substring(0, 50)}...)
              </option>
            ))}
          </select>
          {loadingMessageTemplates && <p className="text-sm text-gray-500 mt-1">Fetching {selectedMessageType} templates...</p>}
          {errorMessageTemplates && <p className="text-sm text-red-500 mt-1">Error: {errorMessageTemplates}</p>}
        </div>

        {/* Dynamic Variable Input Fields */}
        {selectedTemplate && variablesForSelectedTemplate.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-gray-700 font-medium mt-4">Variables:</h3>
            {variablesForSelectedTemplate.map(variable => (
              <div key={variable.variable} className="flex items-center gap-2">
                <label className="w-24 text-gray-600">{variable.mappedVariable}:</label>
                <input type="text" className="flex-1 border border-gray-300 rounded px-3 py-2" value={variableValues[variable.variable] || ''} onChange={(e) => handleVariableValueChange(variable.variable, e.target.value)} placeholder={`Enter value for ${variable.mappedVariable}`} />
              </div>
            ))}
          </div>
        )}

        {/* Mobile Number Input (conditionally rendered) */}
        {selectedMessageType === 'SMS' && (
          <div>
            <label className="block text-gray-700 font-medium mb-1 mt-4">Mobile Number</label>
            <input type="text" className="w-full border border-gray-300 rounded px-3 py-2" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="Enter mobile number" />
          </div>
        )}

        {/* Email Address Input (conditionally rendered) */}
        {selectedMessageType === 'Email' && (
          <div>
            <label className="block text-gray-700 font-medium mb-1 mt-4">Email Address</label>
            <input type="email" className="w-full border border-gray-300 rounded px-3 py-2" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} placeholder="Enter email address" />
          </div>
        )}
      </div>

      {/* Right Side JSON Input Box */}
      <div className="bg-black text-white rounded-lg p-4 w-full md:w-1/2 text-sm flex flex-col">
        <p className="mb-4">
          <strong>POST</strong> https://devapi.softtrails.net/saas/ucs/test/ucs/send

        </p>
        <p className="mb-2 text-pink-400">Request JSON Body:</p>
        <pre className="flex-1 overflow-auto p-2 bg-gray-900 rounded">
          {JSON.stringify(requestJsonBody, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Devapi;


// import React, { useState, useEffect } from 'react';

// const Devapi = () => {
//   // State to hold all the data from the API for modules
//   const [modules, setModules] = useState([]);

//   // State to manage loading and error status for modules API
//   const [loadingModules, setLoadingModules] = useState(true);
//   const [errorModules, setErrorModules] = useState(null);

//   // State for the selected values in each dropdown
//   const [selectedApp, setSelectedApp] = useState('');
//   const [selectedModule, setSelectedModule] = useState('');
//   const [selectedSubModule, setSelectedSubModule] = useState('');

//   // New states for Message Name dropdown and related data
//   const [messageData, setMessageData] = useState(null);
//   const [loadingMessageData, setLoadingMessageData] = useState(true);
//   const [errorMessageData, setErrorMessageData] = useState(null);
//   const [selectedTemplate, setSelectedTemplate] = useState(null);

//   // States for JSON body parameters
//   const [mobileNumber, setMobileNumber] = useState('');
//   const [emailAddress, setEmailAddress] = useState('');

//   // To store values for dynamic variables from message
//   const [variableValues, setVariableValues] = useState({});

//   // New state for radio button selection (Email/SMS)
// const [selectedMessageType, setSelectedMessageType] = useState('Email'); // ✅ default is Email

//   // Helper function to extract variables from the message string
//   const extractVariablesFromMessage = (messageString, templateType, allMappedVariables) => {
//     if (!messageString) return [];
//     const regex = /{#var#}/g; // Matches all occurrences of {#var#}
//     const matches = [...messageString.matchAll(regex)];

//     return matches.map((_, index) => {
//       const genericVarName = `var${index + 1}`;
//       let mappedName = `Variable ${index + 1}`; // Default generic name

//       // Try to find a matching mapped variable from the API response
//       const foundMappedVar = allMappedVariables?.find(mv =>
//         mv.type === templateType && mv.variable === genericVarName
//       );

//       if (foundMappedVar) {
//         mappedName = foundMappedVar.mappedVariable || foundMappedVar.othersMappedVariable || mappedName;
//       }

//       return {
//         variable: genericVarName, // This remains 'var1', 'var2' for internal tracking
//         mappedVariable: mappedName // This is what will be displayed
//       };
//     });
//   };

//   const selectedIdentifier = (selectedApp && selectedModule)
//   ? modules.find(item =>
//       item.applicationName === selectedApp &&
//       item.moduleName === selectedModule
//     )?.uniqueIdentifierName
//   : '';

//   // Fetch data from the modules API when the component mounts
//   useEffect(() => {
//     const fetchModules = async () => {
//       try {
//         const response = await fetch('http://13.204.15.86:8336/api/modules');
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         setModules(data);
//       } catch (e) {
//         setErrorModules(e.message);
//         console.error("Failed to fetch modules:", e);
//       } finally {
//         setLoadingModules(false);
//       }
//     };

//     fetchModules();
//   }, []);

//   // --- Derived data for dropdowns ---
//   const applicationNames = [...new Set(modules.map(item => item.applicationName))];
//   const moduleNames = selectedApp
//     ? [...new Set(modules.filter(item => item.applicationName === selectedApp).map(item => item.moduleName))]
//     : [];
//   const subModuleNames = (selectedApp && selectedModule)
//     ? modules.filter(item => item.applicationName === selectedApp && item.moduleName === selectedModule).map(item => item.subModuleName)
//     : [];

//   // Derived: Get the LM_LR_Name for the selected sub-module to use as an endpoint
//   const lmLrEndpoint = (selectedApp && selectedModule && selectedSubModule)
//     ? modules.find(item =>
//         item.applicationName === selectedApp &&
//         item.moduleName === selectedModule &&
//         item.subModuleName === selectedSubModule
//       )?.LM_LR_Name
//     : null; // Will be null if no full selection

//   // Fetch data for Message Name dropdown based on lmLrEndpoint
//   useEffect(() => {
//     const fetchMessageTemplates = async () => {
//       if (!lmLrEndpoint) {
//         // Clear previous data if endpoint is not available
//         setMessageData(null);
//         setSelectedTemplate(null);
//         setErrorMessageData(null);
//         setLoadingMessageData(false);
//         return;
//       }

//       setLoadingMessageData(true);
//       setErrorMessageData(null);
//       try {
//         // const response = await fetch(`http://13.204.15.86:8336/api/templates/${lmLrEndpoint}`);
//         const response = await fetch(`http://13.204.15.86:8336/api/templates/getByRole/${selectedMessageType}`);

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         setMessageData(data);
//         // Clear selected template if the endpoint changes
//         setSelectedTemplate(null);
//         setVariableValues({});
//         setMobileNumber('');
//         setEmailAddress('');
//       } catch (e) {
//         setErrorMessageData(e.message);
//         console.error("Failed to fetch message templates:", e);
//         setMessageData(null); // Clear data on error
//       } finally {
//         setLoadingMessageData(false);
//       }
//     };

//     fetchMessageTemplates();
//   }, [lmLrEndpoint]); // Dependency on lmLrEndpoint

//   // Get templates for the message name dropdown, FILTERED by selectedMessageType
//   const filteredTemplates = messageData?.templates
//     ? messageData.templates.filter(template =>
//         selectedMessageType === '' || template.type === selectedMessageType
//       )
//     : [];

//   // Get variables from the *selected template's message string*
//   const variablesForSelectedTemplate = selectedTemplate
//     ? extractVariablesFromMessage(
//         selectedTemplate.message,
//         selectedTemplate.type,
//         messageData?.mappedVariables
//       )
//     : [];

//   // --- Event Handlers ---

//   const handleAppChange = (e) => {
//     const newAppName = e.target.value;
//     setSelectedApp(newAppName);
//     // Reset module and submodule if app is unselected or changed
//     setSelectedModule('');
//     setSelectedSubModule('');
//     setSelectedTemplate(null); // Reset template
//     setVariableValues({});
//     setMobileNumber('');
//     setEmailAddress('');
    
//     if (newAppName) {
//       // Auto-select first module and submodule if available
//       const modulesForNewApp = [...new Set(modules
//         .filter(item => item.applicationName === newAppName)
//         .map(item => item.moduleName))];
//       if (modulesForNewApp.length > 0) {
//         const firstModule = modulesForNewApp[0];
//         setSelectedModule(firstModule);
//         const subModulesForFirstModule = modules
//           .filter(item => item.applicationName === newAppName && item.moduleName === firstModule)
//           .map(item => item.subModuleName);
//         if (subModulesForFirstModule.length > 0) {
//           setSelectedSubModule(subModulesForFirstModule[0]);
//         }
//       }
//     }
//   };

//   const handleModuleChange = (e) => {
//     const newModuleName = e.target.value;
//     setSelectedModule(newModuleName);
//     setSelectedSubModule(''); // Reset submodule if module changed
//     setSelectedTemplate(null); // Reset template
//     setVariableValues({});
//     setMobileNumber('');
//     setEmailAddress('');
//     setSelectedMessageType(''); // Reset message type

//     if(newModuleName){
//         const subModulesForNewModule = modules
//             .filter(item => item.applicationName === selectedApp && item.moduleName === newModuleName)
//             .map(item => item.subModuleName);
//         if (subModulesForNewModule.length > 0) {
//             setSelectedSubModule(subModulesForNewModule[0]);
//         }
//     }
//   };

//   const handleSubModuleChange = (e) => {
//     setSelectedSubModule(e.target.value);
//     setSelectedTemplate(null); // Reset template when sub-module changes
//     setVariableValues({});
//     setMobileNumber('');
//     setEmailAddress('');
//     setSelectedMessageType(''); // Reset message type
//   };

//   const handleTemplateChange = (e) => {
//     const selectedTemplateId = e.target.value;
//     const template = filteredTemplates.find(t => t.templateId === selectedTemplateId);
//     setSelectedTemplate(template || null);
//     setVariableValues({});
//     setMobileNumber('');
//     setEmailAddress('');
//   };

//   const handleVariableValueChange = (variableName, value) => {
//     setVariableValues(prevValues => ({
//       ...prevValues,
//       [variableName]: value,
//     }));
//   };

//   const handleMessageTypeChange = (e) => {
//     const newMessageType = e.target.value;
//     setSelectedMessageType(newMessageType);
//     setSelectedTemplate(null);
//     setVariableValues({});
//     // Clear the respective input when message type changes
//     if (newMessageType === 'Email') {
//       setMobileNumber('');
//     } else if (newMessageType === 'SMS') {
//       setEmailAddress('');
//     }
//   };

//   // Construct the JSON body dynamically
// const requestJsonBody = {
//   variables_values: Object.entries(variableValues)
//     .filter(([, value]) => value !== '')
//     .map(([key, value]) => `${key}:${value}`)
//     .join(', '),
//   ...(selectedMessageType === 'Email' ? { email_address: emailAddress } : {}),
//   ...(selectedMessageType === 'SMS' ? { numbers: mobileNumber } : {}),
//   unique_identifier: selectedIdentifier
// };



//   if (loadingModules || loadingMessageData) {
//     return <div className="p-6">Loading API data...</div>;
//   }

//   if (errorModules) {
//     return <div className="p-6 text-red-500">Error loading modules: {errorModules}</div>;
//   }

//   if (errorMessageData) {
//     return <div className="p-6 text-red-500">Error loading message templates: {errorMessageData}</div>;
//   }





//   return (
//     <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-100 md:items-stretch">
//       {/* Left Side Form */}
//       <div className="bg-white shadow-md rounded-lg p-4 w-full md:w-1/2 space-y-2 overflow-y-auto max-h-[calc(100vh-48px)]">
//         <div>
//           <label className="block text-gray-700 font-medium mb-1">Method</label>
//           <select className="w-full border border-gray-300 rounded px-3 py-2" value="POST" readOnly disabled>
//             <option value="POST">POST</option>
//           </select>
//         </div>

//         <div>
//           <label className="block text-gray-700 font-medium mb-1">Application Name</label>
//           <select
//             value={selectedApp}
//             onChange={handleAppChange}
//             className="w-full border border-gray-300 rounded px-3 py-2"
//           >
//             <option value="">Select Application</option>
//             {applicationNames.map(name => (
//               <option key={name} value={name}>{name}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-gray-700 font-medium mb-1">Module Name</label>
//           <select
//             value={selectedModule}
//             onChange={handleModuleChange}
//             className="w-full border border-gray-300 rounded px-3 py-2"
//             disabled={!selectedApp}
//           >
//             <option value="">Select Module</option>
//             {moduleNames.map(name => (
//               <option key={name} value={name}>{name}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-gray-700 font-medium mb-1">Sub Module Name</label>
//           <div className="flex items-center gap-2">
//             <select
//               value={selectedSubModule}
//               onChange={handleSubModuleChange}
//               className="w-full border border-gray-300 rounded px-3 py-2"
//               disabled={!selectedModule}
//             >
//               <option value="">Select Sub Module</option>
//               {subModuleNames.map(name => (
//                 <option key={name} value={name}>{name}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Radio Buttons for Message Type */}
//         <div className="mt-4">
//           <label className="block text-gray-700 font-medium mb-1">Message Type</label>
//           <div className="flex items-center space-x-4">
//             <label className="inline-flex items-center">
//               <input
//                 type="radio"
//                 className="form-radio text-indigo-600"
//                 name="messageType"
//                 value="Email"
//                 checked={selectedMessageType === 'Email'}
//                 onChange={handleMessageTypeChange}
//               />
//               <span className="ml-2 text-gray-700">Email</span>
//             </label>
//             <label className="inline-flex items-center">
//               <input
//                 type="radio"
//                 className="form-radio text-indigo-600"
//                 name="messageType"
//                 value="SMS"
//                 checked={selectedMessageType === 'SMS'}
//                 onChange={handleMessageTypeChange}
//               />
//               <span className="ml-2 text-gray-700">SMS</span>
//             </label>
//           </div>
//         </div>

//         {/* Message Name Dropdown */}
//         <div>
//           <label className="block text-gray-700 font-medium mb-1">Message Name</label>
//           <select
//             value={selectedTemplate ? selectedTemplate.templateId : ''}
//             onChange={handleTemplateChange}
//             className="w-full border border-gray-300 rounded px-3 py-2"
//             disabled={!selectedMessageType || !lmLrEndpoint} // Disabled if no type or no endpoint
//           >
//             <option value="">Select Message</option>
//             {filteredTemplates.map(template => (
//               <option key={template.templateId} value={template.templateId}>
//                 {template.message}
//               </option>
//             ))}
//           </select>
//           {/* Display loading/error for templates */}
//           {loadingMessageData && lmLrEndpoint && <p className="text-sm text-gray-500 mt-1">Fetching messages...</p>}
//           {errorMessageData && lmLrEndpoint && <p className="text-sm text-red-500 mt-1">Error: {errorMessageData}</p>}
//           {!lmLrEndpoint && <p className="text-sm text-gray-500 mt-1">Select all module details to load messages.</p>}
//         </div>

//         {/* Dynamic Variable Input Fields (based on message content and mapped variables) */}
//         {selectedTemplate && variablesForSelectedTemplate.length > 0 && (
//           <div className="space-y-2">
//             <h3 className="text-gray-700 font-medium mt-4">Variables:</h3>
//             {variablesForSelectedTemplate.map(variable => (
//               <div key={variable.variable} className="flex items-center gap-2">
//                 <label className="w-24 text-gray-600">{variable.mappedVariable}:</label>
//                 <input
//                   type="text"
//                   className="flex-1 border border-gray-300 rounded px-3 py-2"
//                   value={variableValues[variable.variable] || ''}
//                   onChange={(e) => handleVariableValueChange(variable.variable, e.target.value)}
//                   placeholder={`Enter value for ${variable.mappedVariable}`}
//                 />
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Mobile Number Input (conditionally rendered) */}
//         {selectedMessageType === 'SMS' && (
//           <div>
//             <label className="block text-gray-700 font-medium mb-1 mt-4">Mobile Number</label>
//             <input
//               type="text"
//               className="w-full border border-gray-300 rounded px-3 py-2"
//               value={mobileNumber}
//               onChange={(e) => setMobileNumber(e.target.value)}
//               placeholder="Enter mobile number"
//             />
//           </div>
//         )}

//         {/* Email Address Input (conditionally rendered) */}
//         {selectedMessageType === 'Email' && (
//           <div>
//             <label className="block text-gray-700 font-medium mb-1 mt-4">Email Address</label>
//             <input
//               type="email"
//               className="w-full border border-gray-300 rounded px-3 py-2"
//               value={emailAddress}
//               onChange={(e) => setEmailAddress(e.target.value)}
//               placeholder="Enter email address"
//             />
//           </div>
//         )}
//       </div>

//       {/* Right Side JSON Input Box */}
//       {/* Right Side JSON Input Box */}
// <div className="bg-black text-white rounded-lg p-4 w-full md:w-1/2 text-sm flex flex-col">
//   <p className="mb-4">
//     <strong>POST</strong> http://13.204.15.86:8336/ucs/send
//   </p>

//   <p className="mb-2 text-pink-400">Request JSON Body:</p>
//   <pre className="flex-1 overflow-auto p-2 bg-gray-900 rounded">
//     {JSON.stringify(requestJsonBody, null, 2)}
//   </pre>
// </div>

//     </div>
//   );
// };

// export default Devapi;

