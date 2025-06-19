// src/components/problem/ProblemPageHeader.js
import { BsLightningChargeFill, BsList } from "react-icons/bs";
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ProblemPageHeader = ({ user, loading, onRun, onSubmit }) => {
  return (
    <header className="bg-[#0F0F0F] flex items-center justify-between p-7 border-b border-gray-700 h-[48px] flex-shrink-0">
      <div className="flex items-center gap-4">
        <BsLightningChargeFill className="text-orange-400 text-2xl" />
        <div className="flex items-center gap-2 text-[#F5F5F5] text-[16px]">
          <BsList className="cursor-pointer text-xl text-[#B7B7B7] hover:text-white"/>
          <span>Problem List</span>
        </div>
        <div className="flex items-center gap-3 text-gray-400">
          <FiChevronLeft className="cursor-pointer hover:text-white"/>
          <FiChevronRight className="cursor-pointer hover:text-white"/>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className={`btn btn-sm bg-gray-600 hover:bg-gray-500 text-white border-0 ${loading ? 'loading' : ''}`} onClick={onRun} disabled={loading}>Run</button>
        <button className={`btn btn-sm bg-green-600 hover:bg-green-700 text-white border-0 ${loading ? 'loading' : ''}`} onClick={onSubmit} disabled={loading}>Submit</button>
      </div>
      <div className="flex items-center gap-4">
        <button className='btn btn-ghost'>{user?.firstName}</button>
        <button className="btn btn-md bg-[#1F1303] text-[#FFA116] border-0 text-md rounded-lg">Premium</button>
      </div>
    </header>
  );
};

export default ProblemPageHeader;