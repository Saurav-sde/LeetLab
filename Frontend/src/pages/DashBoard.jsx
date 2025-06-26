import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import axios from 'axios';

// Chart.js imports
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Other imports
import CalendarHeatmap from 'react-calendar-heatmap';
import { FaMapMarkerAlt, FaUniversity, FaGithub, FaLinkedin, FaChevronDown } from 'react-icons/fa';
import 'react-calendar-heatmap/dist/styles.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip);


// --- Chart Component for the Progress Ring ---
const ProblemProgressChart = ({ stats }) => {
    const {
        easySolved = 0, totalEasy = 1,
        mediumSolved = 0, totalMedium = 1,
        hardSolved = 0, totalHard = 1,
        totalSolved = 0, totalProblems = 1
    } = stats;

    const chartData = useMemo(() => ({
        labels: ['Easy Solved', 'Easy Unsolved', 'Medium Solved', 'Medium Unsolved', 'Hard Solved', 'Hard Unsolved'],
        datasets: [{
            data: [
                easySolved, Math.max(0, totalEasy - easySolved),
                mediumSolved, Math.max(0, totalMedium - mediumSolved),
                hardSolved, Math.max(0, totalHard - hardSolved),
            ],
            backgroundColor: [
                '#00AF9B', '#00AF9B40', // Teal
                '#FFB800', '#FFB80040', // Yellow
                '#FF375F', '#FF375F40',  // Red
            ],
            borderColor: 'transparent',
            borderWidth: 0,
        }]
    }), [stats]);

    const chartOptions = {
        responsive: true, maintainAspectRatio: false, cutout: '85%',
        rotation: -135, circumference: 270,
        plugins: { tooltip: { enabled: false }, legend: { display: false } },
        events: []
    };

    return (
        <div className="relative h-48 w-48 lg:h-52 lg:w-52 flex-shrink-0">
            <Doughnut data={chartData} options={chartOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <p className="text-4xl font-bold text-white">
                    {totalSolved}
                    <span className="text-2xl font-medium text-gray-500">/{totalProblems}</span>
                </p>
                <p className="text-sm text-green-500 mt-1">✓ Solved</p>
            </div>
        </div>
    );
};

// --- Component for a single skill bar ---
const SkillBar = ({ skillName, count, percentage }) => (
    <div className="flex items-center text-sm space-x-4">
        <span className="w-1/3 text-gray-400 truncate">{skillName}</span>
        <div className="w-2/3 flex items-center space-x-3">
            <div className="w-full bg-[#3c3c3c] rounded-full h-2">
                <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <span className="font-medium text-white">{count}</span>
        </div>
    </div>
);

// --- Other Helper Components ---
const StatCard = ({ title, value }) => (
    <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-white text-xl font-semibold">{value}</p>
    </div>
);

const SkillPill = ({ skill }) => (
    <span className="bg-[#3c3c3c] text-xs font-medium px-2.5 py-1.5 rounded-md text-gray-300">{skill}</span>
);

const DifficultyStat = ({ title, solved, total, colorClass }) => (
    <div className="bg-[#373737] p-3 rounded-lg w-30 border border-[#3c3c3c] flex flex-col items-center">
        <p className={`text-md font-medium ${colorClass}`}>{title}</p>
        <p className="text-white text-md font-semibold">
            {solved}
            <span>/{total}</span>
        </p>
    </div>
);


// --- Main Dashboard Component ---
const DashboardPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // const { userId: paramsUserId } = useParams();
    const { user: loggedInUser } = useSelector((state) => state.auth);
    
    const targetUserId = loggedInUser?._id;

    useEffect(() => {
        const fetchData = async () => {
            if (!targetUserId) {
                setError("No user ID specified.");
                setLoading(false);
                return;
            }
            
            setLoading(true);
            setError(null);
            
            try {
                const response = await axios.get(`/user/dashboard/${targetUserId}`);
                setData(response.data);
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
                setError(err.response?.data?.message || "Failed to fetch dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [targetUserId]);

    const heatmapValues = useMemo(() => {
        if (!data?.activity?.heatmapData) return [];
        return Object.keys(data.activity.heatmapData).map(date => ({
            date,
            count: data.activity.heatmapData[date],
        }));
    }, [data?.activity?.heatmapData]);

    const timeAgo = (dateStr) => {
        if (!dateStr) return '';
        const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
        let interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)} days ago`;
        return "Today";
    };

    const maxSkillCount = useMemo(() => {
        if (!data?.stats?.skillStats || data.stats.skillStats.length === 0) {
            return 1;
        }
        return Math.max(...data.stats.skillStats.map(skill => skill.count));
    }, [data?.stats?.skillStats]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-[#1a1a1a]">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-green-500"></div>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center h-screen bg-[#1a1a1a] text-red-500 text-xl text-center p-4">
            {error}
        </div>
    );
    
    if (!data) return (
         <div className="flex justify-center items-center h-screen bg-[#1a1a1a] text-gray-400 text-xl">
            No data available for this user.
        </div>
    );

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-gray-300 font-sans p-4 lg:p-8">
            <div className="mx-auto max-w-[1400px]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* --- LEFT COLUMN --- */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-[#282828] rounded-lg p-5">
                            <div className="flex items-center space-x-4">
                                <img src={data.user?.avatarUrl} alt="avatar" className="w-16 h-16 rounded-lg object-cover"/>
                                <div>
                                    <h1 className="text-xl font-medium text-white">{data.user?.firstName} {data.user?.lastName}</h1>
                                    <p className="text-sm text-gray-400">@{data.user?.username}</p>
                                    <p className="text-sm text-gray-400">Rank {data.user?.contestStats?.globalRank?.toLocaleString() || 'N/A'}</p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-gray-300 leading-relaxed">{data.user?.bio}</p>
                            <button className="mt-4 w-full bg-[#373737] text-gray-200 text-sm py-2 rounded-md hover:bg-[#4a4a4a]">Edit Profile</button>
                            <div className="mt-4 space-y-3 text-sm">
                                {data.user?.location && <p className="flex items-center text-gray-400"><FaMapMarkerAlt className="mr-3"/>{data.user.location}</p>}
                                {data.user?.university && <p className="flex items-center text-gray-400"><FaUniversity className="mr-3"/>{data.user.university}</p>}
                                {data.user?.github && <a href={`https://github.com/${data.user.github}`} target="_blank" rel="noreferrer" className="flex items-center text-gray-400 hover:text-white"><FaGithub className="mr-3"/>{data.user.github}</a>}
                                {data.user?.linkedin && <a href={data.user.linkedin} target="_blank" rel="noreferrer" className="flex items-center text-gray-400 hover:text-white"><FaLinkedin className="mr-3"/>{data.user.linkedin}</a>}
                            </div>
                        </div>
                        {(data.stats?.languageStats && Object.values(data.stats.languageStats).some(v => v > 0)) && (
                            <div className="bg-[#282828] rounded-lg p-5">
                               <h3 className="text-base font-semibold text-white mb-3">Languages</h3>
                                {Object.entries(data.stats.languageStats).map(([lang, count]) => count > 0 && (
                                    <div key={lang} className="text-sm mb-2">
                                        <div className="flex justify-between text-gray-400">
                                            <span className="capitalize">{lang}</span>
                                            <span className="text-white font-medium">{count} <span className="text-gray-500">solved</span></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                         {(data.user?.technicalSkills && data.user.technicalSkills.length > 0) && (
                            <div className="bg-[#282828] rounded-lg p-5">
                                <h3 className="text-base font-semibold text-white mb-3">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {data.user.technicalSkills.map(skill => <SkillPill key={skill} skill={skill} />)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT COLUMN --- */}
                    <div className="lg:col-span-9 space-y-6">
                        <div className="bg-[#282828] rounded-lg p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                           <StatCard title="Contest Rating" value={data.user?.contestStats?.rating?.toLocaleString() || 'N/A'} />
                           <StatCard title="Global Ranking" value={data.user?.contestStats?.globalRank?.toLocaleString() || 'N/A'} />
                           <StatCard title="Contests Attended" value={data.user?.contestStats?.contestsAttended || 0} />
                        </div>

                        {/* === NEW: Container for the two top cards === */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* Solved Problems Card (Now smaller) */}
                            <div className="lg:col-span-6 bg-[#282828] rounded-lg p-5 flex flex-col sm:flex-row items-center justify-center gap-6">
                                <ProblemProgressChart stats={data.stats.problemStats} />
                                <div className="w-full sm:w-auto grid grid-cols-1 gap-4">
                                    <DifficultyStat title="Easy" solved={data.stats.problemStats.easySolved} total={data.stats.problemStats.totalEasy} colorClass="text-[#00AF9B]" />
                                    <DifficultyStat title="Med." solved={data.stats.problemStats.mediumSolved} total={data.stats.problemStats.totalMedium} colorClass="text-[#FFB800]" />
                                    <DifficultyStat title="Hard" solved={data.stats.problemStats.hardSolved} total={data.stats.problemStats.totalHard} colorClass="text-[#FF375F]" />
                                </div>
                            </div>
                            
                            {/* NEW: Skills Breakdown Card */}
                            <div className="lg:col-span-6 bg-[#282828] rounded-lg p-5">
                                <h3 className="text-base font-semibold text-white mb-4">Skills Breakdown</h3>
                                <div className="space-y-4">
                                    {data.stats.skillStats?.length > 0 ? (
                                        data.stats.skillStats.map(skill => (
                                            <SkillBar 
                                                key={skill.name}
                                                skillName={skill.name}
                                                count={skill.count}
                                                percentage={(skill.count / maxSkillCount) * 100}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-center text-gray-400 py-8">Solve problems to see your skills breakdown.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#282828] rounded-lg p-5">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                <h3 className="text-lg font-medium text-white flex items-center">
                                    {data.activity.totalSubmissions} submissions in the past one year
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                    <span>Total active days: <span className="text-white font-medium">{data.activity.totalActiveDays}</span></span>
                                    <span>Max streak: <span className="text-white font-medium">{data.activity.maxStreak}</span></span>
                                    <div className="bg-[#1a1a1a] p-2 rounded-md flex items-center space-x-2 cursor-pointer">
                                        <span className="text-white">Current</span>
                                        <FaChevronDown className="text-gray-400"/>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 react-calendar-heatmap-container">
                                <CalendarHeatmap
                                    startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                                    endDate={new Date()}
                                    values={heatmapValues}
                                    classForValue={(value) => {
                                        if (!value || value.count === 0) return 'color-empty';
                                        return `color-github-${Math.min(Math.ceil(value.count / 2), 4)}`;
                                    }}
                                    showWeekdayLabels={false}
                                    showMonthLabels={true}
                                />
                            </div>
                        </div>

                        <div className="bg-[#282828] rounded-lg p-5">
                           <h3 className="text-base font-semibold text-white mb-2">Recent Accepted Submissions</h3>
                           <div className="space-y-1">
                                {data.recentSubmissions?.length > 0 ? (
                                    data.recentSubmissions.map((sub) => (
                                        <div key={sub.problemId} className="flex justify-between items-center text-sm p-3 rounded-md transition-colors hover:bg-[#3c3c3c]">
                                            <p className="font-medium text-gray-200">{sub.problemTitle}</p>
                                            <p className="text-gray-400">{timeAgo(sub.submittedAt)}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-400 py-4">No recent accepted submissions.</p>
                                )}
                           </div>
                        </div>
                    </div>
                </div>
            </div>
             <style>
                {`
                    .react-calendar-heatmap-container .color-empty { fill: #2d2d2d; }
                    .react-calendar-heatmap-container .color-github-1 { fill: #0e4429; }
                    .react-calendar-heatmap-container .color-github-2 { fill: #006d32; }
                    .react-calendar-heatmap-container .color-github-3 { fill: #26a641; }
                    .react-calendar-heatmap-container .color-github-4 { fill: #39d353; }
                    .react-calendar-heatmap text { font-size: 10px; fill: #9CA3AF; }
                `}
            </style>
        </div>
    );
};

export default DashboardPage;