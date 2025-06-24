import React from 'react';
import { NavLink } from 'react-router'; // Correct import for NavLink
import { Plus, Edit, Trash2, Video, Terminal } from 'lucide-react';

function Admin() {
  // Updated adminOptions to fit the new neutral theme
  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Design and add a new coding challenge to the platform.',
      icon: Plus,
      iconColor: 'text-yellow-500',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Find and edit existing problems, test cases, and solutions.',
      icon: Edit,
      iconColor: 'text-yellow-500',
      route: '/admin/update'
    },
    {
      id: 'video',
      title: 'Manage Videos',
      description: 'Upload, link, or delete solution video walkthroughs.',
      icon: Video,
      iconColor: 'text-yellow-500',
      route: '/admin/video'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Permanently remove a problem from the live platform.',
      icon: Trash2,
      iconColor: 'text-red-500', // Destructive actions are highlighted in red
      route: '/admin/delete'
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-4 mb-4">
             <Terminal className="w-12 h-12 text-yellow-400"/>
             <h1 className="text-5xl font-bold text-neutral-100 font-mono">
                Admin Dashboard
             </h1>
          </div>
          <p className="text-neutral-400 text-lg font-mono">
            Platform Management & Content Curation
          </p>
        </div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                // The 'group' class allows us to style child elements on hover
                className="group bg-neutral-800 border border-neutral-700 rounded-lg transition-all duration-300 transform hover:-translate-y-2 hover:border-yellow-500/80 shadow-lg shadow-black/20"
              >
                <div className="flex flex-col items-center text-center p-8 h-full">
                  {/* Icon */}
                  <div className="bg-neutral-900 p-4 rounded-full mb-5 border border-neutral-700">
                    <IconComponent size={32} className={option.iconColor} />
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-xl font-bold text-neutral-100 mb-2">
                    {option.title}
                  </h2>
                  
                  {/* Description */}
                  <p className="text-neutral-400 text-sm flex-grow mb-8">
                    {option.description}
                  </p>
                  
                  {/* Action Button */}
                  <div className="w-full mt-auto">
                    <NavLink 
                       to={option.route}
                       className="inline-block w-full font-mono text-sm font-semibold text-neutral-300 border border-neutral-600 bg-neutral-700/50 rounded-md px-6 py-3
                                  group-hover:bg-yellow-500 group-hover:text-black group-hover:border-yellow-500
                                  transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                       Select
                   </NavLink>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Admin;