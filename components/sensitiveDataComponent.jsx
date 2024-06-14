// SensitiveDataForm.js
import React from 'react';

const SensitiveDataForm = ({ phone, setPhone, email, setEmail, notes, setNotes, handleSensitiveDataFormSubmit }) => {
  return (
    <form onSubmit={handleSensitiveDataFormSubmit} className="mb-4 text-sm">
      <label className="block mb-2">
        Phone:
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="border border-gray-300 rounded-md p-1 w-1/2 mt-1" />
      </label>
      <label className="block mb-2">
        Email:
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border border-gray-300 rounded-md p-1 w-1/2 mt-1" />
      </label>
      <label className="block mb-2">
       Notes:
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="border border-gray-300 rounded-md p-1 w-1/2 mt-1" />
      </label>
      <button type="submit" className="bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 transition duration-300">Save</button>
    </form>
  );
};

export default SensitiveDataForm;