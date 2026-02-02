import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductindividualShow = () => {
  const [exploreData, setExploreData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    axios
      .get('http://13.204.15.86:3008/explore/getExplore')
      .then((response) => {
        setExploreData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching explore data:', error);
        setLoading(false);
      });
  };

  const handleDelete = async (product_id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`http://13.204.15.86:3008/explore/deleteExplore/${product_id}`);
      setExploreData((prev) => prev.filter((item) => item.product_id !== product_id));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!exploreData.length) return <div className="text-center mt-10 text-red-600">No data found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {exploreData.map((item) => (
        <div
          key={item.detail_id}
          className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-gray-200 relative"
        >
          <button
            onClick={() => handleDelete(item.product_id)}
            className="absolute top-4 right-4 text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-50"
          >
            Delete
          </button>

          <h2 className="text-2xl font-bold text-center">{item.product_name}</h2>
          <p className="text-center text-gray-600">{item.product_description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <img src={item.product_image} alt="Product" className="w-full rounded-xl shadow" />
            <img src={item.home_image} alt="Home" className="w-full rounded-xl shadow" />
          </div>

          <div className="bg-gray-100 p-4 rounded-xl">
            <h3 className="text-xl font-semibold">{item.home_header}</h3>
            <p className="text-gray-700">{item.home_description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <img src={item.split_image} alt="Split" className="w-full rounded-xl" />
            <img src={item.mobile_image} alt="Mobile" className="w-full rounded-xl" />
          </div>

          {item.sub_templates?.length > 0 && (
            <div className="mt-4 bg-blue-50 p-4 rounded-xl">
              <h4 className="text-lg font-bold mb-2">Sub Templates</h4>
              <ul className="space-y-2 list-disc pl-5 text-gray-800">
                {item.sub_templates.map((sub) => (
                  <li key={sub.temp_id}>
                    <strong>{sub.header}</strong>: {sub.description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProductindividualShow;
