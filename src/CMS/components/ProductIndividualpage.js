import React, { useState } from 'react';

export default function ProductIndividualpage() {
  const [form, setForm] = useState({
    product_id: '',
    product_name: '',
    product_image: '',
    product_description: '',
    home_image: '',
    home_header: '',
    home_description: '',
    created_by: '',
    split_image: '',
    mobile_image: '',
    slug: '',
    sub_templates: [{ header: '', description: '' }],
  });

  const [productImageFile, setProductImageFile] = useState(null);
  const [homeImageFile, setHomeImageFile] = useState(null);
  const [splitImageFile, setSplitImageFile] = useState(null);
  const [mobileImageFile, setMobileImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubTemplateChange = (idx, e) => {
    const { name, value } = e.target;
    const updated = form.sub_templates.map((item, i) =>
      i === idx ? { ...item, [name]: value } : item
    );
    setForm({ ...form, sub_templates: updated });
  };

  const addSubTemplate = () => {
    setForm({
      ...form,
      sub_templates: [...form.sub_templates, { header: '', description: '' }],
    });
  };

  async function uploadImage(file, documentName, userId) {
    const publishRes = await fetch("https://saaspro.softtrails.net/cms/pro/content/uploadImage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_payload: {
          name: "new CMS",
          description: "service for new CMS"
        },
        doctype_payload: {
          doctype: "CMS logo",
          description: "logo for cards"
        },
        allow_doc_payload: {
          doc_name: documentName,
          description: "logos"
        }
      })
    });

    const publishData = await publishRes.json();
    const publish_id = publishData?.id || publishData?.data?.id;

    if (!publish_id) throw new Error("Failed to get publish_id");

    const formData = new FormData();
    formData.append("documents", file);
    formData.append("ref", "CMS");
    formData.append("custom_folder", "fdf");
    formData.append("metadata", JSON.stringify([
      {
        service: "new CMS",
        publish_id,
        user_id: userId,
        document_name: documentName
      }
    ]));

    const docRes = await fetch("https://devdemo.softtrails.net/node/intrane/dmsapi/upload-documents", {
      method: "POST",
      body: formData
    });

    const docData = await docRes.json();
    return docData?.uploaded_files?.[0]?.file_url;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userId = form.created_by;

      const productImageUrl = await uploadImage(productImageFile, "Product Image", userId);
      const homeImageUrl = await uploadImage(homeImageFile, "Home Image", userId);
      const splitImageUrl = await uploadImage(splitImageFile, "Split Image", userId);
      const mobileImageUrl = await uploadImage(mobileImageFile, "Mobile Image", userId);

      const payload = {
        ...form,
        product_id: Number(form.product_id),
        created_by: Number(form.created_by),
        product_image: productImageUrl,
        home_image: homeImageUrl,
        split_image: splitImageUrl,
        mobile_image: mobileImageUrl
      };

      const res = await fetch('https://saaspro.softtrails.net/cms/pro/explore/addExplore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      alert('Submitted! ' + JSON.stringify(data));
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f6f7fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          padding: '32px',
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          width: 400,
          maxWidth: '95%'
        }}
      >
        <h2 style={{ textAlign: 'center', color: '#19325c', marginBottom: 24 }}>Add Product</h2>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Product ID</label>
          <input name="product_id" type="number" value={form.product_id} onChange={handleChange} required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Product Name</label>
          <input name="product_name" value={form.product_name} onChange={handleChange} required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Product Description</label>
          <textarea name="product_description" value={form.product_description} onChange={handleChange} required style={textareaStyle} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Created By (User ID)</label>
          <input name="created_by" type="number" value={form.created_by} onChange={handleChange} required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Home Header</label>
          <input name="home_header" value={form.home_header} onChange={handleChange} required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Home Description</label>
          <textarea name="home_description" value={form.home_description} onChange={handleChange} required style={textareaStyle} />
        </div>

        {/* File Inputs */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Product Image File</label>
          <input type="file" onChange={(e) => setProductImageFile(e.target.files[0])} required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Home Image File</label>
          <input type="file" onChange={(e) => setHomeImageFile(e.target.files[0])} required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Split Image File</label>
          <input type="file" onChange={(e) => setSplitImageFile(e.target.files[0])} required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Mobile Image File</label>
          <input type="file" onChange={(e) => setMobileImageFile(e.target.files[0])} required style={inputStyle} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Slug</label>
          <input name="slug" value={form.slug} onChange={handleChange} required style={inputStyle} />
        </div>

        <h4 style={{ color: '#19325c', margin: '24px 0 8px 0' }}>Sub Templates</h4>
        {form.sub_templates.map((st, idx) => (
          <div key={idx} style={{ marginBottom: 14, background: '#f6f7fa', borderRadius: 6, padding: 10 }}>
            <label style={labelStyle}>Header</label>
            <input name="header" value={st.header} onChange={(e) => handleSubTemplateChange(idx, e)} required style={inputStyle} />
            <label style={labelStyle}>Description</label>
            <textarea name="description" value={st.description} onChange={(e) => handleSubTemplateChange(idx, e)} required style={textareaStyle} />
          </div>
        ))}
        <button type="button" onClick={addSubTemplate} style={buttonStyleSecondary}>Add Sub Template</button>

        <button type="submit" style={buttonStylePrimary}>Submit</button>
      </form>
    </div>
  );
}

// Styling
const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 15,
  marginTop: 4,
  marginBottom: 4,
  background: '#f9fafb'
};

const textareaStyle = {
  ...inputStyle,
  minHeight: 48,
  resize: 'vertical'
};

const labelStyle = {
  display: 'block',
  marginBottom: 2,
  color: '#19325c',
  fontWeight: 500
};

const buttonStylePrimary = {
  width: '100%',
  padding: '12px 0',
  background: '#19325c',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  fontWeight: 'bold',
  fontSize: 16,
  cursor: 'pointer'
};

const buttonStyleSecondary = {
  marginBottom: 18,
  background: '#e8eaf6',
  color: '#19325c',
  border: 'none',
  borderRadius: 4,
  padding: '8px 14px',
  cursor: 'pointer',
  fontWeight: 500
};
