import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button} from '@mui/material';
import { FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { JAVA_BASE, ASSET_NODE_BASE ,MAIN_BASE } from "../../config/apiBase"
const Organization = () => {
  const [userData, setUserData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [projectData, setProjectData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [uom, setUom] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId');
  const token = sessionStorage.getItem('token');

  const handleHome = () => {
    navigate('/Cards');
  };

  const verifyToken = async () => {
    if (!token) {
      navigate('/');
      return;
    }
    try {
      const response = await axios.post(`${MAIN_BASE}users/verify-token`, { token: token });
      console.log('Token is valid:', response.data);
    } catch (error) {
      console.error('Token verification failed:', error.response ? error.response.data : error.message);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('tokenExpiry');
      navigate('/');
    }
  };

  useEffect(() => {
    verifyToken();
  }, [token]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${MAIN_BASE}users/id_user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, token]);

    // Fetch Categories on Component Mount
useEffect(() => {
  const token = sessionStorage.getItem("token"); // get token

  axios
    .get(`${JAVA_BASE}api/categories/rawmaterials`, {
      headers: {
        Authorization: `Bearer ${token}`, // add token here
      },
    })
    .then((response) => {
      setCategories(response.data); // Assuming response.data contains the category list
    })
    .catch((error) => {
      console.error('Error fetching categories:', error);
    });
}, []);

useEffect(() => {
  const fetchProjects = async () => {
    const token = sessionStorage.getItem("token"); // get token
    try {
      const response = await axios.get(`${JAVA_BASE}api/fine-goods/all`, {
        headers: {
          Authorization: `Bearer ${token}`, // add token here
        },
      });
      setProjects(response.data);
      setProjectData(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  fetchProjects();
}, []);

useEffect(() => {
  if (selectedCategory) {
    const token = sessionStorage.getItem("token"); // get token
    axios
      .post(
        `${ASSET_NODE_BASE}getColumnTypesAndData`,
        { categoryName: selectedCategory },
        {
          headers: {
            Authorization: `Bearer ${token}`, // add token here
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setMaterials(response.data); // Assuming response.data contains the material list for the category
      })
      .catch((error) => {
        console.error('Error fetching materials:', error);
      });
  }
}, [selectedCategory]);



  useEffect(() => {
    if (selectedProject) {
      const filteredData = projects.filter(
        (project) => String(project.project_Id) === String(selectedProject)
      );
      setProjectData(filteredData);
    } else {
      setProjectData(projects);
    }
  }, [selectedProject, projects]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    // Fetch materials based on the selected category
    const selectedCategoryData = categories.find(
      (category) => category.categoryId === event.target.value
    );
    setMaterials(selectedCategoryData ? selectedCategoryData.materials : []);
  };

  const handleMaterialChange = (event) => {
    setSelectedMaterial(event.target.value);
    // Set UOM based on the selected material
    const selectedMaterialData = materials.find(
      (material) => material.materialId === event.target.value
    );
    setUom(selectedMaterialData ? selectedMaterialData.uom : '');
  };

  const uniqueProjects = Array.from(
    new Map(projects.map(item => [item.project_Id, item])).values()
  ).filter(project =>
    project.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex">
      <div className="p-6 w-full">
        <div className="bg-custome-blue rounded-lg w-full px-3 py-2 flex items-center justify-between shadow-lg sticky top-0 z-10">
          <div className="flex items-center">
            <button onClick={handleHome} type="button" className="flex items-center p-2 rounded-full">
              <FaHome className="text-white mr-2" size={25} />
            </button>
            <h1 className="text-white text-2xl sm:text-2xl font-bold ml-2">Fine Goods</h1>
          </div>
          {userData && (
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} type="button" className="bg-white flex items-center rounded-full mt-2 sm:mt-0 sm:mr-5 px-2 py-2">
              <div className="bg-white rounded-3xl flex items-center">
                <div className="mr-2">
                  <img
                    src="http://cdn.builder.io/api/v1/image/assets/TEMP/8839e5a86c91c744ae902ecbb75ae11121a15ba11a67d20ec56f825e116dd9ef?placeholderIfAbsent=true&apiKey=f4328c4a551b4b9fa165bba17dc932db"
                    alt="Profile Icon"
                    className="h-6 w-6 sm:h-8 sm:w-8 rounded-full"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xs sm:text-sm font-bold text-custome-black">
                    {userData.first_name} {userData.last_name}
                  </h3>
                </div>
              </div>
            </button>
          )}
        </div>

        <div className="mt-4 flex space-x-4 items-center">
          {/* Project Dropdown */}
          <div className="w-1/4">
            <label
              htmlFor="project-select"
              className="block text-sm font-medium text-gray-700"
            >
              Select Project
            </label>
            <select
              id="project-select"
              value={selectedProject}
              onChange={handleProjectChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Select Project</option>
              {uniqueProjects.map((project) => (
                <option key={project.project_Id} value={project.project_Id}>
                  {project.projectName}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="w-1/4">
            <label
              htmlFor="search-projects"
              className="block text-sm font-medium text-gray-700"
            >
              Search Projects
            </label>
            <input
              id="search-projects"
              type="text"
              placeholder="Search Projects"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
        {/* Table to display project data */}
        <TableContainer component={Paper} className="mt-4">
  <Table>
    <TableHead>
      <TableRow>
        <TableCell className="bg-gray-200 font-bold">S.No</TableCell> {/* Serial No. Column */}
        <TableCell className="bg-gray-200 font-bold">Project Name</TableCell>
        <TableCell className="bg-gray-200 font-bold">Material Name</TableCell>
        <TableCell className="bg-gray-200 font-bold">Status</TableCell>
        <TableCell className="bg-gray-200 font-bold">Stages</TableCell>
        <TableCell className="bg-gray-200 font-bold">Quantity</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {projectData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
        <TableRow key={index} className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
          <TableCell>{page * rowsPerPage + index + 1}</TableCell> {/* Serial No. Logic */}
          <TableCell>{row.projectName}</TableCell>
          <TableCell>{row.materialName}</TableCell>
          <TableCell>{row.status}</TableCell>
          <TableCell>{row.stages}</TableCell>
          <TableCell>{row.projectQuantity}</TableCell>
        </TableRow>
      ))}
      {projectData.length === 0 && (
        <TableRow>
          <TableCell colSpan={6} align="center">
            No data available
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>


        {/* Pagination Controls */}
        <div className="mt-4 flex justify-between">
          <Button
            variant="contained"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="px-4 py-2"
          >
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(projectData.length / rowsPerPage) - 1}
            className="px-4 py-2"
          >
            Next
          </Button>
        </div>



      </div>
    </div>
  );
};

export default Organization;
