import { useState, useEffect } from "react";
import MessageModal from "../../NewComponents/MessageModal";
import { HRMS_API_BASE } from "../../config/apiBase";

const WorkingDays = () => {
  const [yearType, setYearType] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [messageType, setMessageType] = useState("success");

  const weeks = ["1 Week", "2 Week", "3 Week", "4 Week", "5 Week"];

  const emptyDays = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  const [days, setDays] = useState(emptyDays);

  useEffect(() => {
    const fetchWorkingDays = async () => {
      if (!yearType) return; 
      try {
        const res = await fetch(`${HRMS_API_BASE}/leave/working-days`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // ✅ Added token
          },
        });

        const data = await res.json();

        if (Array.isArray(data)) {
          const filtered = data.filter(
            (entry) =>
              entry.year_type?.toLowerCase() === yearType.toLowerCase()
          );

          const updatedDays = { ...emptyDays };

          filtered.forEach((entry) => {
            let selectedWeeks;
            if (entry.weeks.includes("all")) {
              selectedWeeks = [...weeks];
            } else {
              selectedWeeks = entry.weeks.map((w) => `${w} Week`);
            }
            updatedDays[entry.day_name] = selectedWeeks;
          });

          setDays(updatedDays);
        }
      } catch (error) {
        console.error("Error fetching working days:", error);
      }
    };

    fetchWorkingDays();
  }, [yearType]);

  const handleWeekChange = (day, week) => {
    setDays((prev) => {
      const isSelected = prev[day].includes(week);
      let updatedWeeks;

      if (week === "all") {
        updatedWeeks = isSelected ? [] : [...weeks];
      } else {
        updatedWeeks = isSelected
          ? prev[day].filter((w) => w !== week)
          : [...prev[day], week];
      }

      return { ...prev, [day]: updatedWeeks };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!yearType) {
      setMessageType("error");
      setSuccessMsg("Please select a year type before submitting!");
      setTimeout(() => setSuccessMsg(""), 3000);
      return;
    }

    const apiData = {
      year_type: yearType.toLowerCase(),
      working_day: Object.entries(days).map(([day, selectedWeeks]) => ({
        day_name: day,
        weeks:
          selectedWeeks.length === weeks.length
            ? ["all"]
            : selectedWeeks.map((w) => w.split(" ")[0]),
      })),
    };
    try {
      const res = await fetch(`${HRMS_API_BASE}/leave/days`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify(apiData),
      });

      const data = await res.json();

      if (data.message) {
        setMessageType("success");
        setSuccessMsg(data.message);
      } else {
        setMessageType("error");
        setSuccessMsg("Something went wrong!");
      }
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setSuccessMsg("Network error occurred!");
    } finally {
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <div className="max-w-4xl p-6">
      <select
        value={yearType}
        onChange={(e) => setYearType(e.target.value)}
        className="w-1/3 border border-gray-300 rounded-md p-2 mb-4"
      >
        <option value="" disabled>
          Select Year Type
        </option>
        <option value="Calendar">Calendar</option>
        <option value="Financial">Financial</option>
      </select>

      <table className="w-full bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Day</th>
            <th className="border p-2 text-center">All</th>
            {weeks.map((week) => (
              <th key={week} className="border p-2 text-center">
                {week}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(days).map((day) => (
            <tr key={day}>
              <td className="border p-2 font-medium">{day}</td>
              <td className="border p-2 text-center">
                <input
                  type="checkbox"
                  disabled={!yearType} // ✅ Disable until year type is selected
                  checked={days[day].length === weeks.length}
                  onChange={() => handleWeekChange(day, "all")}
                />
              </td>
              {weeks.map((week) => (
                <td key={week} className="border p-2 text-center">
                  <input
                    type="checkbox"
                    disabled={!yearType} // ✅ Disable until year type is selected
                    checked={days[day].includes(week)}
                    onChange={() => handleWeekChange(day, week)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleSubmit}
        disabled={!yearType} 
        className={`mt-4 w-1/3 text-white p-2 rounded-md ${
          yearType
            ? "bg-blue-500 hover:bg-blue-600"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Submit
      </button>

      <MessageModal
        message={successMsg}
        type={messageType}
        setMessage={setSuccessMsg}
      />
    </div>
  );
};
export default WorkingDays;