import { useState, useEffect } from 'react';
import ecosystemData from '../../public/ecosystem/ecosystem.json';

export default function EcosystemGrid() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Data is already imported, so we only update the state
      setProjects(ecosystemData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading ecosystem data:", error);
      setIsLoading(false);
    }
  }, []);

  const openProjectModal = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // If loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#18d1ce]"></div>
      </div>
    );
  }

  const handleImageError = (e) => {
    e.target.src = "/placeholder-logo.png"; // Fallback image
  };

  return (
    <div className="w-full h-full">
      {/* Grid de proyectos */}
      <div className="grid grid-cols-4 gap-2 pb-2">
        {projects.map((project, index) => (
          <div 
            key={index} 
            className="relative bg-gray-50 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 hover:shadow-md"
            onClick={() => openProjectModal(project)}
          >
            <div className="w-16 h-16 flex items-center justify-center overflow-hidden">
              <img 
                src={project.logo_url.replace('public/', '/')} 
                alt={project.name} 
                className="max-w-full max-h-full object-contain"
                onError={handleImageError}
              />
            </div>
            <div className="text-xs font-medium mt-1 text-center truncate w-full">
              {project.name}
            </div>
            {/* Indicador de estado como círculo coloreado en la esquina superior derecha */}
            <div className="absolute top-1 right-1">
              <div 
                className={`h-3 w-3 rounded-full ${
                  project.status === 'LIVE' 
                    ? 'bg-green-500' 
                    : 'bg-blue-400'
                }`}
                title={project.status}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal detalle del proyecto */}
      {showModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="w-16 h-16 flex items-center justify-center overflow-hidden mr-4">
                    <img 
                      src={selectedProject.logo_url.replace('public/', '/')} 
                      alt={selectedProject.name} 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-bold">{selectedProject.name}</h3>
                </div>
                <div className={`text-xs px-2 py-1 rounded-md 
                  ${selectedProject.category === 'DEFI' ? 'bg-blue-500 text-white' : 
                   selectedProject.category === 'NFT' ? 'bg-purple-500 text-white' : 
                   'bg-gray-500 text-white'}`}>
                  {selectedProject.category}
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{selectedProject.summary}</p>
              
              <div className="flex justify-between items-center">
                {/* Recuadro de estado simplificado */}
                <div className={`text-xs font-semibold px-3 py-1 rounded-md ${
                  selectedProject.status === 'LIVE' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-400 text-white'
                }`}>
                  {selectedProject.status}
                </div>
                
                <a 
                  href={selectedProject.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 text-sm"
                >
                  Visitar
                </a>
              </div>
              
              <button 
                className="absolute top-0 right-0 -mt-4 -mr-4 text-gray-500 hover:text-gray-700"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 