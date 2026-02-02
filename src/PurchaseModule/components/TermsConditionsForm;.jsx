import React, { useEffect, useState } from "react";

function TermsConditionsForm({ onChange }) {
  const [terms, setTerms] = useState([]);
  const [newTerm, setNewTerm] = useState({ title: "", description: "" });
  const [expanded, setExpanded] = useState({}); // track which term is expanded
  const [allExpanded, setAllExpanded] = useState(false); // global toggle

 useEffect(() => {
  fetch("/terms.json")
    .then((res) => res.json())
    .then((data) => {
      setTerms(data);
      // initially all collapsed
      const initial = {};
      data.forEach((t) => (initial[t.id] = false));
      setExpanded(initial);
      // FIX: Notify parent of initial terms
      onChange?.(data);
    });
}, []);
  const handleAddTerm = () => {
    if (newTerm.title && newTerm.description) {
      const updatedTerms = [...terms, { ...newTerm, id: terms.length + 1 }];
      setTerms(updatedTerms);
      setNewTerm({ title: "", description: "" });
      onChange?.(updatedTerms);
    }
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    const newState = !allExpanded;
    const updated = {};
    terms.forEach((t) => (updated[t.id] = newState));
    setExpanded(updated);
    setAllExpanded(newState);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submit with Terms:", terms);
    onChange?.(terms);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-2 font-semibold text-gray-700 flex justify-between">
        <span>Terms & Conditions</span>
        {terms.length > 0 && (
          <button
            type="button"
            onClick={toggleAll}
            className="text-blue-600 hover:underline text-sm"
          >
            {allExpanded ? "Show less all" : "Show all"}
          </button>
        )}
      </div>

      {/* Existing Terms */}
      <ul className="list-disc pl-5 text-gray-700 space-y-2">
        {terms.map((term) => {
          const isExpanded = expanded[term.id];
          const shortText =
            term.description.length > 120
              ? term.description.slice(0, 120) + "..."
              : term.description;

          return (
            <li key={term.id} className="text-sm">
              <strong>{term.title}:</strong>{" "}
              {isExpanded ? term.description : shortText}
              {term.description.length > 120 && (
                <button
                  type="button"
                  className="ml-2 text-blue-600 hover:underline"
                  onClick={() => toggleExpand(term.id)}
                >
                  {isExpanded ? "Show less" : "Show more"}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {/* Add New Term */}
      <div className="mt-4 space-y-2">
        <input
          type="text"
          placeholder="Title"
          value={newTerm.title}
          onChange={(e) => setNewTerm({ ...newTerm, title: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <textarea
          placeholder="Description"
          value={newTerm.description}
          onChange={(e) =>
            setNewTerm({ ...newTerm, description: e.target.value })
          }
          className="border p-2 w-full rounded"
        />
        <button
          type="button"
          onClick={handleAddTerm}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Term
        </button>
      </div>

   
    </form>
  );
}

export default TermsConditionsForm;
