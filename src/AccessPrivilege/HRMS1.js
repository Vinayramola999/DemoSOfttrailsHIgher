import axios from 'axios';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import React, { useState } from 'react';
import Select from "react-select";
import { ChevronDown, ChevronUp } from "lucide-react";
import useFetchEmails from '../NewComponents/useFetchEmails';
Modal.setAppElement('#root');

const UpdateAccess = () => {
    const emails = useFetchEmails();
    const [selectedEmail, setSelectedEmail] = useState('');
    const [apiAccess, setApiAccess] = useState([]);

    //for each states
    const [isHRMSChecked, setIsHRMSChecked] = useState(false);
    const [isLMCChecked, setIsLMCChecked] = useState(false);
    const [hasAmsAccess, setHasAmsAccess] = useState(false);

    // Leave Management Child states
    const [isCreateChecked, setIsCreateChecked] = useState(false);
    const [isApplyChecked, setIsApplyChecked] = useState(false);
    const [isBalanceChecked, setIsBalanceChecked] = useState(false);
    const [isApprovalChecked, setIsApprovalChecked] = useState(false);
    const [isPolicyChecked, setIsPolicyChecked] = useState(false);
    const [isAddPolicyChecked, setIsAddPolicyChecked] = useState(false);
    const [isSchedularChecked, setIsSchedularChecked] = useState(false);
    const [isYearSetUpChecked, setIsYearSetUpChecked] = useState(false);
    const [isAllBalanceChecked, setIsAllBalanceChecked] = useState(false);
    const [isHolidayChecked, setIsHolidayChecked] = useState(false);
    const [isAddHolidayChecked, setIsAddHolidayChecked] = useState(false);
    const [isViewHolidayChecked, setIsViewHolidayChecked] = useState(false);
    const [isDeleteHolidayChecked, setIsDeleteHolidayChecked] = useState(false);
    const [isAllStatusChecked, setIsAllStatusChecked] = useState(false);
    const [isAllWorkChecked, setIsAllWorkChecked] = useState(false);
    const [isApprovalBalanceChecked, setIsApprovalBalanceChecked] = useState(false);

    //HR CORNER Child States
    const [isHRChecked, setIsHRChecked] = useState(false);
    const [isEmployeeChecked, setIsEmployeeChecked] = useState(false);
    const [isUploadDocumentChecked, setIsUploadDocumentChecked] = useState(false);
    const [isLetterChecked, setIsLetterChecked] = useState(false);
    const [isSalarySlipChecked, setIsSalarySlipChecked] = useState(false);
    const [isRecruitmentActivityChecked, setIsRecruitmentActivityChecked] = useState(false);
    const [isPostJobChecked, setIsPostJobChecked] = useState(false);
    const [isTalentDatabaseChecked, setIsTalentDatabaseChecked] = useState(false);
    const [isFlagDataChecked, setIsFlagDataChecked] = useState(false);
    const [isHRPoliciesChecked, setIsHRPoliciesChecked] = useState(false);
    const [isDocumentChecked, setIsDocumentChecked] = useState(false);
    const [isBulkAttendanceChecked, setIsBulkAttendanceChecked] = useState(false);

    //Attendance Child States
    const [isAttendanceTabChecked, setIsAttendanceTabChecked] = useState(false);
    const [isAttendanceChecked, setIsAttendanceChecked] = useState(false);
    const [isIndividualAttendanceChecked, setIsIndividualAttendanceChecked] = useState(false);
    const [isTeamAttendanceChecked, setIsTeamAttendanceChecked] = useState(false);
    const [isRegularizationChecked, setIsRegularizationChecked] = useState(false);
    const [isRegularizationSubChecked, setIsRegularizationSubChecked] = useState(false);
    const [isManagerApprovalChecked, setIsManagerApprovalChecked] = useState(false);

    //PMS Child States
    const [isPMSChecked, setIsPMSChecked] = useState(false);
    const [isGoalChecked, setIsGoalChecked] = useState(false);
    const [isKRAChecked, setIsKRAChecked] = useState(false);
    const [isMappingChecked, setIsMappingChecked] = useState(false);

    const handleEmailChange = async (e) => {
        const userId = e.target.value;
        setSelectedEmail(userId);
        if (userId) {
            try {
                const response = await axios.get(`https://devdemo.softtrails.net/access/access/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    },
                });
                const filteredAccess = response.data.filter(access => access.user_id === parseInt(userId));
                const apiAccessNames = filteredAccess.map(access => access.api_name);
                setApiAccess(apiAccessNames);
                setHasAmsAccess(apiAccessNames.includes('update_access'));
                setIsHRMSChecked(apiAccessNames.includes('HRMS'));                //CARDS1
                setIsLMCChecked(apiAccessNames.includes('LMC'));
                setIsCreateChecked(apiAccessNames.includes('Create'));                 //LEAVE MAANGEMENT CARD
                setIsApplyChecked(apiAccessNames.includes('Apply'));
                setIsBalanceChecked(apiAccessNames.includes('Balance'));
                setIsApprovalChecked(apiAccessNames.includes('Approval'));
                setIsPolicyChecked(apiAccessNames.includes('Policy'));
                setIsSchedularChecked(apiAccessNames.includes('Schedular'));
                setIsAddPolicyChecked(apiAccessNames.includes('AddPolicy'));
                setIsYearSetUpChecked(apiAccessNames.includes('YearSet'));
                setIsHolidayChecked(apiAccessNames.includes('Holiday'));
                setIsAddHolidayChecked(apiAccessNames.includes('AddHoliday'));
                setIsViewHolidayChecked(apiAccessNames.includes('ViewHoliday'));
                setIsDeleteHolidayChecked(apiAccessNames.includes('DeleteHoliday'));
                setIsAllBalanceChecked(apiAccessNames.includes('AllBalance'));
                setIsAllStatusChecked(apiAccessNames.includes('Status'));
                setIsAllWorkChecked(apiAccessNames.includes('Work'));
                setIsApprovalBalanceChecked(apiAccessNames.includes('ApprovalBalance'));

                setIsHRChecked(apiAccessNames.includes('HR'));                   //HRCorner
                setIsEmployeeChecked(apiAccessNames.includes('EmployeeData'));
                setIsUploadDocumentChecked(apiAccessNames.includes('UploadDocument'));
                setIsLetterChecked(apiAccessNames.includes('RevisionLetter'));
                setIsSalarySlipChecked(apiAccessNames.includes('SalarySlip'));
                setIsRecruitmentActivityChecked(apiAccessNames.includes('Recruitment'));
                setIsTalentDatabaseChecked(apiAccessNames.includes('TalentDatabase'));
                setIsPostJobChecked(apiAccessNames.includes('PostJob'));
                setIsFlagDataChecked(apiAccessNames.includes('FlagData'));
                setIsHRPoliciesChecked(apiAccessNames.includes('HRPolicies'));
                setIsDocumentChecked(apiAccessNames.includes('Document'));
                setIsBulkAttendanceChecked(apiAccessNames.includes('BulkAttendance'));

                setIsAttendanceTabChecked(apiAccessNames.includes('AttendanceTab'));             //AttendanceManagement
                setIsAttendanceChecked(apiAccessNames.includes('Attendance'));
                setIsIndividualAttendanceChecked(apiAccessNames.includes('Individual'));
                setIsTeamAttendanceChecked(apiAccessNames.includes('TeamAttendance'));
                setIsRegularizationChecked(apiAccessNames.includes('RegularizationTab'));
                setIsRegularizationSubChecked(apiAccessNames.includes('Regularization'));
                setIsManagerApprovalChecked(apiAccessNames.includes('ManagerApproval'));

                setIsPMSChecked(apiAccessNames.includes('PMS'));
                setIsGoalChecked(apiAccessNames.includes('Goal'));
                setIsKRAChecked(apiAccessNames.includes('KRA'));
                setIsMappingChecked(apiAccessNames.includes('Mapping'));
            } catch (error) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No Access',
                    text: 'No Access is available for the provided User.',
                });
            }
        } else {
            setApiAccess([]);
            setIsHRMSChecked(false);
            setIsLMCChecked(false);

            setIsCreateChecked(false);
            setIsApplyChecked(false);
            setIsBalanceChecked(false);
            setIsApprovalChecked(false);
            setIsPolicyChecked(false);
            setIsSchedularChecked(false);
            setIsAddPolicyChecked(false);
            setIsYearSetUpChecked(false);
            setIsHolidayChecked(false);
            setIsAddHolidayChecked(false);
            setIsViewHolidayChecked(false);
            setIsDeleteHolidayChecked(false);
            setIsAllBalanceChecked(false);
            setIsAllStatusChecked(false);
            setIsAllWorkChecked(false);
            setIsApprovalBalanceChecked(false);

            setIsHRChecked(false);
            setIsEmployeeChecked(false);
            setIsLetterChecked(false);
            setIsSalarySlipChecked(false);
            setIsRecruitmentActivityChecked(false);
            setIsTalentDatabaseChecked(false);
            setIsPostJobChecked(false);
            setIsFlagDataChecked(false);
            setIsHRPoliciesChecked(false);
            setIsDocumentChecked(false);
            setIsBulkAttendanceChecked(false);

            setIsAttendanceTabChecked(false);
            setIsAttendanceChecked(false);
            setIsIndividualAttendanceChecked(false);
            setIsTeamAttendanceChecked(false);
            setIsRegularizationChecked(false);
            setIsRegularizationSubChecked(false);
            setIsManagerApprovalChecked(false);

            setIsPMSChecked(false);
            setIsGoalChecked(false);
            setIsKRAChecked(false);
            setIsMappingChecked(false);
        }
    };

    // const handleApiAccessChange = async (apiName) => {
    //     const isAlreadySelected = apiAccess.includes(apiName);
    //     setApiAccess((prev) =>
    //         isAlreadySelected
    //             ? prev.filter((name) => name !== apiName) // Remove API if unchecked
    //             : [...prev, apiName] // Add API if checked
    //     );

    //     if (apiName === 'update_access') {
    //         setHasAmsAccess((prev) => !prev);
    //     } else if (apiName === 'HRMS') {
    //         setIsHRMSChecked((prev) => !prev);
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = sessionStorage.getItem('token');
        if (!token) {
            Swal.fire({
                icon: 'error',
                title: 'Unauthorized',
                text: 'Token does not exist.',
            });
            return;
        }
        const selectedModule = 'HRMS';
        const selectedApiAccess = [];
        if (isHRMSChecked) selectedApiAccess.push('HRMS');

        if (isLMCChecked) selectedApiAccess.push('LMC');
        if (isCreateChecked) selectedApiAccess.push('Create');
        if (isApplyChecked) selectedApiAccess.push('Apply');
        if (isBalanceChecked) selectedApiAccess.push('Balance');
        if (isApprovalChecked) selectedApiAccess.push('Approval');
        if (isPolicyChecked) selectedApiAccess.push('Policy');
        if (isSchedularChecked) selectedApiAccess.push('Schedular');
        if (isAddPolicyChecked) selectedApiAccess.push('AddPolicy');
        if (isYearSetUpChecked) selectedApiAccess.push('YearSet');
        if (isAllBalanceChecked) selectedApiAccess.push('AllBalance');
        if (isHolidayChecked) selectedApiAccess.push('Holiday');
        if (isAddHolidayChecked) selectedApiAccess.push('AddHoliday');
        if (isViewHolidayChecked) selectedApiAccess.push('ViewHoliday');
        if (isDeleteHolidayChecked) selectedApiAccess.push('DeleteHoliday');
        if (isAllStatusChecked) selectedApiAccess.push('Status');
        if (isAllWorkChecked) selectedApiAccess.push('Work');
        if (isApprovalBalanceChecked) selectedApiAccess.push('ApprovalBalance');

        if (isHRChecked) selectedApiAccess.push('HR');
        if (isEmployeeChecked) selectedApiAccess.push('EmployeeData');
        if (isUploadDocumentChecked) selectedApiAccess.push('UploadDocument');
        if (isLetterChecked) selectedApiAccess.push('RevisionLetter');
        if (isSalarySlipChecked) selectedApiAccess.push('SalarySlip');
        if (isRecruitmentActivityChecked) selectedApiAccess.push('Recruitment');
        if (isPostJobChecked) selectedApiAccess.push('PostJob');
        if (isTalentDatabaseChecked) selectedApiAccess.push('TalentDatabase');
        if (isFlagDataChecked) selectedApiAccess.push('FlagData');
        if (isHRPoliciesChecked) selectedApiAccess.push('HRPolicies');
        if (isDocumentChecked) selectedApiAccess.push('Document');
        if (isBulkAttendanceChecked) selectedApiAccess.push('BulkAttendance');

        if (isAttendanceTabChecked) selectedApiAccess.push('AttendanceTab');
        if (isAttendanceChecked) selectedApiAccess.push('Attendance');
        if (isIndividualAttendanceChecked) selectedApiAccess.push('Individual');
        if (isTeamAttendanceChecked) selectedApiAccess.push('TeamAttendance');
        if (isRegularizationChecked) selectedApiAccess.push('RegularizationTab');
        if (isRegularizationSubChecked) selectedApiAccess.push('Regularization');
        if (isManagerApprovalChecked) selectedApiAccess.push('ManagerApproval');

        if (isPMSChecked) selectedApiAccess.push('PMS');
        if (isGoalChecked) selectedApiAccess.push('Goal');
        if (isKRAChecked) selectedApiAccess.push('KRA');
        if (isMappingChecked) selectedApiAccess.push('Mapping');
        try {
            const response = await axios.put(
                'https://devdemo.softtrails.net/access/update_access',
                {
                    user_id: selectedEmail,
                    module: selectedModule,
                    api_access: selectedApiAccess,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'User Updated Successfully!',
                });
            } else if (response.data.error === "User not found. Please check the email entered.") {
                Swal.fire({
                    icon: 'error',
                    title: 'User Not Found',
                    text: 'Please check the email entered.',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Error: ${response.data.error}`,
                });
            }
        } catch (error) {
            const { response } = error;

            if (response) {
                if (response.status === 403) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Permission Denied',
                        text: 'You do not have permission to perform this action.',
                    });
                } else if (response.status === 404) {
                    Swal.fire({
                        icon: 'error',
                        title: 'User Not Found',
                        text: 'Please check the email entered.',
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Update Failed',
                        text: 'Error updating API access.',
                    });
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Network Error',
                    text: 'Error updating API access.',
                });
            }
        }
    };

    const handleUploadDocumentToggle = () => {
        if (isUploadDocumentChecked) {
            // If turning OFF → remove all child permissions
            setIsLetterChecked(false);
            setIsSalarySlipChecked(false);
            setIsDocumentChecked(false);
        }
        setIsUploadDocumentChecked(!isUploadDocumentChecked);
    };


    const Checkbox = ({ label, checked, onChange }) => (
        <label className="flex items-center space-x-2">
            <input type="checkbox" checked={checked} onChange={onChange} className="form-checkbox text-indigo-600 focus:ring-indigo-500" /> <span>{label}</span>
        </label>
    );

    return (
        <div className="w-full max-h-[80vh] overflow-auto">
            <div className="bg-white p-4 rounded-lg shadow-md mt-3">
                <form onSubmit={handleSubmit}>

                    <div className="flex flex-col sm:flex-row sm:items-center mt-5 ml-5 w-full sm:w-[50%]">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-4" > Select User: </label>
                        <div className="w-full sm:w-[60%]">
                            <Select id="email" options={emails} value={emails.find((user) => user.value === selectedEmail) || null} onChange={(selectedOption) => { handleEmailChange({ target: { value: selectedOption?.value || "" } }); }} placeholder="Search or select user..." isSearchable classNamePrefix="react-select" styles={{ control: (base) => ({ ...base, borderRadius: "0.5rem", padding: "2px", borderColor: "#d1d5db", boxShadow: "none", "&:hover": { borderColor: "#2563eb" }, }), }} />
                        </div>
                    </div>

                    <div className="w-full h-[300px] overflow-y-auto p-4">
                        <div className="bg-white p-6 space-y-4">
                            {/* HRMS Header */}
                            <div className="cursor-pointer flex justify-between items-center" onClick={() => setIsHRMSChecked(!isHRMSChecked)}>
                                <span className="text-lg font-semibold text-blue-700">HRMS</span>
                                {isHRMSChecked ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                            </div>

                            {/* HRMS Content */}
                            {isHRMSChecked && (
                                <div className="pl-4 border-l-2 border-blue-200 space-y-6">
                                    {/* Leave Management */}
                                    <div>
                                        <Checkbox label="Leave Management Card" checked={isLMCChecked} onChange={() => setIsLMCChecked(!isLMCChecked)} />
                                        {isLMCChecked && (
                                            <div className="pl-6 mt-2 space-y-2">
                                                <Checkbox label="Leave Policy" checked={isPolicyChecked}
                                                    onChange={() => {
                                                        if (isPolicyChecked) { 
                                                            setIsSchedularChecked(false); 
                                                            setIsAddPolicyChecked(false); 
                                                        }
                                                        setIsPolicyChecked(!isPolicyChecked);
                                                    }}
                                                />
                                                {isPolicyChecked && (
                                                    <div className="pl-6 space-y-2">
                                                        <Checkbox label="Schedular " checked={isSchedularChecked} onChange={() => setIsSchedularChecked(!isSchedularChecked)} />
                                                        <Checkbox label="Add Policy" checked={isAddPolicyChecked} onChange={() => setIsAddPolicyChecked(!isAddPolicyChecked)} />
                                                    </div>
                                                )}
                                                <Checkbox label="Create Leave" checked={isCreateChecked} onChange={() => setIsCreateChecked(!isCreateChecked)} />
                                                <Checkbox label="Apply Leave" checked={isApplyChecked} onChange={() => setIsApplyChecked(!isApplyChecked)} />
                                                <Checkbox label="Balance Leave" checked={isBalanceChecked} onChange={() => setIsBalanceChecked(!isBalanceChecked)} />
                                                <Checkbox label="Leave Approval" checked={isApprovalChecked} onChange={() => setIsApprovalChecked(!isApprovalChecked)} />
                                                <Checkbox label="Year Setup" checked={isYearSetUpChecked} onChange={() => setIsYearSetUpChecked(!isYearSetUpChecked)} />
                                                <Checkbox label="Holidays" checked={isHolidayChecked}
                                                    onChange={() => {
                                                        if (isHolidayChecked) { 
                                                            setIsAddHolidayChecked(false); 
                                                            setIsViewHolidayChecked(false); 
                                                            setIsDeleteHolidayChecked(false); 
}
                                                        setIsHolidayChecked(!isHolidayChecked);
                                                    }}
                                                />
                                                {isHolidayChecked && (
                                                    <div className="pl-6 space-y-2">
                                                        <Checkbox label="Add Holiday" checked={isAddHolidayChecked} onChange={() => setIsAddHolidayChecked(!isAddHolidayChecked)} />
                                                        <Checkbox label="View Holiday" checked={isViewHolidayChecked} onChange={() => setIsViewHolidayChecked(!isViewHolidayChecked)} />
                                                        <Checkbox label="Delete Holiday" checked={isDeleteHolidayChecked} onChange={() => setIsDeleteHolidayChecked(!isDeleteHolidayChecked)} />
                                                    </div>
                                                )}
                                                <Checkbox label="All Balance" checked={isAllBalanceChecked} onChange={() => setIsAllBalanceChecked(!isAllBalanceChecked)} />
                                                <Checkbox label="Leave Status" checked={isAllStatusChecked} onChange={() => setIsAllStatusChecked(!isAllStatusChecked)} />
                                                <Checkbox label="Working Days" checked={isAllWorkChecked} onChange={() => setIsAllWorkChecked(!isAllWorkChecked)} />
                                                <Checkbox label="Balance Approval" checked={isApprovalBalanceChecked} onChange={() => setIsApprovalBalanceChecked(!isApprovalBalanceChecked)} />
                                            </div>
                                        )}
                                    </div>

                                    {/* HR Corner */}
                                    <div>
                                        <Checkbox label="HR Corner" checked={isHRChecked} onChange={() => setIsHRChecked(!isHRChecked)} />
                                        {isHRChecked && (
                                            <div className="pl-6 mt-2 space-y-2">
                                                <Checkbox
                                                    label="Employees"
                                                    checked={isEmployeeChecked}
                                                    onChange={() => {
                                                        if (isEmployeeChecked) {
                                                            setIsUploadDocumentChecked(false);
                                                            setIsLetterChecked(false);
                                                            setIsSalarySlipChecked(false);
                                                            setIsDocumentChecked(false);
                                                        }
                                                        setIsEmployeeChecked(!isEmployeeChecked);
                                                    }}
                                                />

                                                {isEmployeeChecked && (
                                                    <div className="ml-6 mt-2 space-y-2">
                                                        {/* Upload Document (Parent) */}
                                                        <Checkbox
                                                            label="Upload Documents"
                                                            checked={isUploadDocumentChecked}
                                                            onChange={handleUploadDocumentToggle}
                                                        />

                                                        {/* Child tabs appear ONLY if Upload Documents is selected */}
                                                        {isUploadDocumentChecked && (
                                                            <div className="ml-6 mt-2 space-y-2">
                                                                <Checkbox
                                                                    label="Revision Letter"
                                                                    checked={isLetterChecked}
                                                                    onChange={() => setIsLetterChecked(!isLetterChecked)}
                                                                />
                                                                <Checkbox
                                                                    label="Appointment Letter"
                                                                    checked={isSalarySlipChecked}
                                                                    onChange={() => setIsSalarySlipChecked(!isSalarySlipChecked)}
                                                                />
                                                                <Checkbox
                                                                    label="Document Access"
                                                                    checked={isDocumentChecked}
                                                                    onChange={() => setIsDocumentChecked(!isDocumentChecked)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}


                                                <Checkbox label="Recruitment Activity" checked={isRecruitmentActivityChecked} onChange={() => setIsRecruitmentActivityChecked(!isRecruitmentActivityChecked)} />
                                                {isRecruitmentActivityChecked && (
                                                    <div className="pl-6 space-y-2">
                                                        <Checkbox label="Post a Job" checked={isPostJobChecked} onChange={() => setIsPostJobChecked(!isPostJobChecked)} />
                                                        <Checkbox label="Talent Database" checked={isTalentDatabaseChecked} onChange={() => setIsTalentDatabaseChecked(!isTalentDatabaseChecked)} />
                                                        <Checkbox label="Flagged Application" checked={isFlagDataChecked} onChange={() => setIsFlagDataChecked(!isFlagDataChecked)} />
                                                    </div>
                                                )}
                                                <Checkbox label="HR Policies" checked={isHRPoliciesChecked} onChange={() => setIsHRPoliciesChecked(!isHRPoliciesChecked)} />
                                                <Checkbox label="Bulk Attendance" checked={isBulkAttendanceChecked} onChange={() => setIsBulkAttendanceChecked(!isBulkAttendanceChecked)} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Attendance Management */}
                                    <div>
                                        <Checkbox label="Attendance Management" checked={isAttendanceTabChecked} onChange={() => setIsAttendanceTabChecked(!isAttendanceTabChecked)} />
                                        {isAttendanceTabChecked && (
                                            <div className="pl-6 mt-2 space-y-2">
                                                {/* Attendance Tab */}
                                                <Checkbox label="Attendance" checked={isAttendanceChecked} onChange={() => setIsAttendanceChecked(!isAttendanceChecked)} />
                                                {isAttendanceChecked && (
                                                    <div className="pl-6 space-y-2">
                                                        <Checkbox label="Individual Attendance" checked={isIndividualAttendanceChecked} onChange={() => setIsIndividualAttendanceChecked(!isIndividualAttendanceChecked)} />
                                                        <Checkbox label="Team Attendance" checked={isTeamAttendanceChecked} onChange={() => setIsTeamAttendanceChecked(!isTeamAttendanceChecked)} />
                                                    </div>
                                                )}
                                                {/* Regularization Tab */}
                                                <Checkbox label="Regularization" checked={isRegularizationChecked} onChange={() => setIsRegularizationChecked(!isRegularizationChecked)} />
                                                {isRegularizationChecked && (
                                                    <div className="pl-6 space-y-2">
                                                        <Checkbox label="Regularization" checked={isRegularizationSubChecked} onChange={() => setIsRegularizationSubChecked(!isRegularizationSubChecked)} />
                                                        <Checkbox label="Manager Approval" checked={isManagerApprovalChecked} onChange={() => setIsManagerApprovalChecked(!isManagerApprovalChecked)} />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/*PMS */}
                                    <div>
                                        <Checkbox label="Performance Management Card" checked={isPMSChecked} onChange={() => setIsPMSChecked(!isPMSChecked)} />
                                        {isPMSChecked && (
                                            <div className="pl-6 mt-2 space-y-2">
                                                <Checkbox label="Goal" checked={isGoalChecked} onChange={() => setIsGoalChecked(!isGoalChecked)} />
                                                <Checkbox label="KRA's" checked={isKRAChecked} onChange={() => setIsKRAChecked(!isKRAChecked)} />
                                                <Checkbox label="Goal & KRA's Mapping" checked={isMappingChecked} onChange={() => setIsMappingChecked(!isMappingChecked)} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-6 ml-5">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none" >
                            Update Access
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default UpdateAccess;