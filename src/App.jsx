import React, { useState } from 'react'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('metadata')

  // Basic fields
  const [name, setName] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [studio, setStudio] = useState('')
  const [website, setWebsite] = useState('')
  const [email, setEmail] = useState('')
  const [jobId, setJobId] = useState('')
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [keywords, setKeywords] = useState('')

  // Advanced fields
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [sublocation, setSublocation] = useState('')

  const [rightsHolder, setRightsHolder] = useState('')
  const [usageTerms, setUsageTerms] = useState('')
  const [copyrightUrl, setCopyrightUrl] = useState('')

  const [modelInfo, setModelInfo] = useState('')
  const [modelRelease, setModelRelease] = useState('')
  const [minorAgeInfo, setMinorAgeInfo] = useState('')
  const [propertyRelease, setPropertyRelease] = useState('')
  const [imageType, setImageType] = useState('')

  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [postalCode, setPostalCode] = useState('')

  const [cameraModel, setCameraModel] = useState('')
  const [lens, setLens] = useState('')
  const [focalLength, setFocalLength] = useState('')
  const [exposure, setExposure] = useState('')
  const [iso, setIso] = useState('')
  const [flash, setFlash] = useState('')
  const [captureDate, setCaptureDate] = useState('')

  const [instructions, setInstructions] = useState('')
  const [transmissionRef, setTransmissionRef] = useState('')
  const [urgency, setUrgency] = useState('')

  function escapeXml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  function downloadXmp() {
    const xmp = `<?xpacket begin=\"\uFEFF\" id=\"W5M0MpCehiHzreSzNTczkc9d\"?>\n<x:xmpmeta xmlns:x=\"adobe:ns:meta/\" xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:photoshop=\"http://ns.adobe.com/photoshop/1.0/\" xmlns:xmpRights=\"http://ns.adobe.com/xap/1.0/rights/\">\n  <rdf:RDF>\n    <rdf:Description>\n      <dc:creator><rdf:Seq><rdf:li>${escapeXml(name)}</rdf:li></rdf:Seq></dc:creator>\n      <dc:title><rdf:Alt><rdf:li xml:lang=\"x-default\">${escapeXml(title)}</rdf:li></rdf:Alt></dc:title>\n      <dc:description><rdf:Alt><rdf:li xml:lang=\"x-default\">${escapeXml(caption)}</rdf:li></rdf:Alt></dc:description>\n      <dc:subject><rdf:Bag>${keywords.split(',').map(k => `<rdf:li>${escapeXml(k.trim())}</rdf:li>`).join('\n')}</rdf:Bag></dc:subject>\n      <dc:rights><rdf:Alt><rdf:li xml:lang=\"x-default\">© ${escapeXml(name)} ${year}</rdf:li></rdf:Alt></dc:rights>\n      <photoshop:Credit>${escapeXml(studio)}</photoshop:Credit>\n      <photoshop:Source>${escapeXml(website)}</photoshop:Source>\n      <photoshop:TransmissionReference>${escapeXml(jobId)}</photoshop:TransmissionReference>\n    </rdf:Description>\n  </rdf:RDF>\n</x:xmpmeta>\n<?xpacket end=\"w\"?>`

    const blob = new Blob([xmp], { type: 'application/xml' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'metadata-preset.xmp'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(a.href)
  }

  const Tooltip = ({ text }) => (
    <span className="tooltip">?
      <span className="tooltiptext">{text}</span>
    </span>
  )

  function handleCsvImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      const parsed = text.split(/[,\n]/).map(k => k.trim()).filter(Boolean)
      setKeywords(parsed.join(', '))
    }
    reader.readAsText(file)
  }

  return (
    <div className="app">
      <header>
        <h1 className="app-title">AutoMeta</h1>
      </header>

      <nav className="tabs">
        <button className={tab === 'metadata' ? 'active' : ''} onClick={() => setTab('metadata')}>Metadata</button>
        <button className={tab === 'keywords' ? 'active' : ''} onClick={() => setTab('keywords')}>Keywords</button>
        <button className={tab === 'raw' ? 'active' : ''} onClick={() => setTab('raw')}>RAW Sidecars</button>
        <button className={tab === 'advanced' ? 'active' : ''} onClick={() => setTab('advanced')}>Advanced</button>
      </nav>

      <main>
        {tab === 'metadata' && (
          <section>
            <h2>Basic Metadata</h2>
            <div className="form-grid single">
              <div className="form-group"><label>Name / Creator <Tooltip text="Image creator or photographer's name." /><input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your Name" /></label></div>
              <div className="form-group"><label>Year <Tooltip text="Year of copyright or creation." /><input type="text" value={year} onChange={e=>setYear(e.target.value)} placeholder="2025" /></label></div>
              <div className="form-group"><label>Credit / Studio <Tooltip text="Photographer's name or studio name." /><input type="text" value={studio} onChange={e=>setStudio(e.target.value)} placeholder="Studio" /></label></div>
              <div className="form-group"><label>Website <Tooltip text="Your website URL." /><input type="text" value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://example.com" /></label></div>
              <div className="form-group"><label>Contact Email <Tooltip text="Your contact email address." /><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></label></div>
              <div className="form-group"><label>Job ID <Tooltip text="Optional identifier for your project or assignment." /><input type="text" value={jobId} onChange={e=>setJobId(e.target.value)} placeholder="12345" /></label></div>
              <div className="form-group"><label>Title <Tooltip text="Title of the image." /><input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Image Title" /></label></div>
              <div className="form-group"><label>Caption / Description <Tooltip text="Brief description of the image." /><textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Write a short description" /></label></div>
              <div className="form-group">
                <label>Keywords <Tooltip text="Comma-separated keywords that describe the image." />
                  <textarea className="keywords" value={keywords} onChange={e=>setKeywords(e.target.value)} placeholder="portrait, studio, model" />
                </label>
                <label className="csv-import-label">
                  Import keyword .csv
                  <input className="csv-import" type="file" accept=".csv" onChange={handleCsvImport} />
                </label>
              </div>
              {keywords && <div className="keyword-count">{keywords.split(',').length} keywords</div>}
            </div>

            <button className="download-xmp" onClick={downloadXmp}>Download XMP</button>

            <h3>Preview</h3>
            <pre className="preview">{`
© ${name} ${year} — ${studio}
Title: ${title}
Caption: ${caption}
Website: ${website}
Email: ${email}
Job ID: ${jobId}
Keywords: ${keywords}

--- Advanced ---
Location: ${city}, ${state}, ${country}, ${sublocation}
Rights Holder: ${rightsHolder}
Usage Terms: ${usageTerms}
Copyright URL: ${copyrightUrl}
Model Info: ${modelInfo}
Model Release: ${modelRelease}
Minor Age Info: ${minorAgeInfo}
Property Release: ${propertyRelease}
Image Type: ${imageType}
Contact: ${address}, ${phone}, ${postalCode}

EXIF:
Date/Time: ${captureDate}
Camera: ${cameraModel}
Lens: ${lens}
Focal Length: ${focalLength}
Exposure: ${exposure}
ISO: ${iso}
Flash: ${flash}

Administrative:
Instructions: ${instructions}
Transmission Reference: ${transmissionRef}
Urgency: ${urgency}
            `}</pre>
          </section>
        )}

        {tab === 'advanced' && (
          <section>
            <h2>Advanced Metadata</h2>

            <h3>Location</h3>
            <div className="form-grid single">
              <div className="form-group"><label>City <Tooltip text="City where the photo was taken." /><input type="text" value={city} onChange={e=>setCity(e.target.value)} /></label></div>
              <div className="form-group"><label>State / Province <Tooltip text="Region or state where the photo was taken." /><input type="text" value={state} onChange={e=>setState(e.target.value)} /></label></div>
              <div className="form-group"><label>Country <Tooltip text="Country where the photo was taken." /><input type="text" value={country} onChange={e=>setCountry(e.target.value)} /></label></div>
              <div className="form-group"><label>Sublocation <Tooltip text="Smaller place such as park, building, or neighborhood." /><input type="text" value={sublocation} onChange={e=>setSublocation(e.target.value)} /></label></div>
            </div>

            <h3>Rights & Licensing</h3>
            <div className="form-grid single">
              <div className="form-group"><label>Rights Holder <Tooltip text="Person or organization that owns the copyright." /><input type="text" value={rightsHolder} onChange={e=>setRightsHolder(e.target.value)} /></label></div>
              <div className="form-group"><label>Usage Terms <Tooltip text="Conditions under which the photo may be used." /><input type="text" value={usageTerms} onChange={e=>setUsageTerms(e.target.value)} /></label></div>
              <div className="form-group"><label>Copyright URL <Tooltip text="Link to copyright or licensing information." /><input type="text" value={copyrightUrl} onChange={e=>setCopyrightUrl(e.target.value)} /></label></div>
            </div>

            <h3>Models & Releases</h3>
            <div className="form-grid single">
              <div className="form-group"><label>Model Info <Tooltip text="Names of models or subjects in the photo." /><input type="text" value={modelInfo} onChange={e=>setModelInfo(e.target.value)} /></label></div>
              <div className="form-group"><label>Model Release <Tooltip text="Indicate if a signed model release is available (Yes/No)." /><input type="text" value={modelRelease} onChange={e=>setModelRelease(e.target.value)} /></label></div>
              <div className="form-group"><label>Minor Age Info <Tooltip text="If any models are minors, note their age or status." /><input type="text" value={minorAgeInfo} onChange={e=>setMinorAgeInfo(e.target.value)} /></label></div>
              <div className="form-group"><label>Property Release <Tooltip text="Indicate if a signed property release is available (Yes/No)." /><input type="text" value={propertyRelease} onChange={e=>setPropertyRelease(e.target.value)} /></label></div>
              <div className="form-group"><label>Image Type <Tooltip text="Original capture, scan, composite, illustration, etc." /><input type="text" value={imageType} onChange={e=>setImageType(e.target.value)} /></label></div>
            </div>

            <h3>Contact</h3>
            <div className="form-grid single">
              <div className="form-group"><label>Address <Tooltip text="Street or mailing address." /><input type="text" value={address} onChange={e=>setAddress(e.target.value)} /></label></div>
              <div className="form-group"><label>Phone <Tooltip text="Phone number for contact." /><input type="text" value={phone} onChange={e=>setPhone(e.target.value)} /></label></div>
              <div className="form-group"><label>Postal Code <Tooltip text="ZIP or postal code." /><input type="text" value={postalCode} onChange={e=>setPostalCode(e.target.value)} /></label></div>
            </div>

            <h3 className="exif-header">EXIF Technical</h3>
            <p className="warning">⚠️ Only change these values if originals are missing or incorrect (e.g., scanned images).</p>
            <div className="form-grid single">
              <div className="form-group"><label>Capture Date/Time <Tooltip text="Date/time when the photo was taken. Useful for scanned images." /><input type="datetime-local" value={captureDate} onChange={e=>setCaptureDate(e.target.value)} /></label></div>
              <div className="form-group"><label>Camera Model <Tooltip text="Camera model used (e.g., Canon EOS R5)." /><input type="text" value={cameraModel} onChange={e=>setCameraModel(e.target.value)} /></label></div>
              <div className="form-group"><label>Lens <Tooltip text="Lens info, e.g., 24-70mm f/2.8." /><input type="text" value={lens} onChange={e=>setLens(e.target.value)} /></label></div>
              <div className="form-group"><label>Focal Length <Tooltip text="Focal length used for the photo." /><input type="text" value={focalLength} onChange={e=>setFocalLength(e.target.value)} /></label></div>
              <div className="form-group"><label>Exposure <Tooltip text="Shutter speed and aperture, e.g., 1/200 sec at f/4." /><input type="text" value={exposure} onChange={e=>setExposure(e.target.value)} /></label></div>
              <div className="form-group"><label>ISO <Tooltip text="ISO (International Organization for Standardization) sensitivity rating. Higher values mean more light sensitivity but more noise." /><input type="text" value={iso} onChange={e=>setIso(e.target.value)} /></label></div>
              <div className="form-group"><label>Flash <Tooltip text="Whether flash was used (Yes/No)." /><input type="text" value={flash} onChange={e=>setFlash(e.target.value)} /></label></div>
            </div>

            <h3>Administrative</h3>
            <div className="form-grid single">
              <div className="form-group"><label>Instructions <Tooltip text="Notes for editors or publishers." /><textarea value={instructions} onChange={e=>setInstructions(e.target.value)} /></label></div>
              <div className="form-group"><label>Transmission Reference <Tooltip text="Identifier for agency or publisher workflow." /><input type="text" value={transmissionRef} onChange={e=>setTransmissionRef(e.target.value)} /></label></div>
              <div className="form-group"><label>Urgency / Priority <Tooltip text="Ranking for speed (1 = highest, 9 = lowest)." /><input type="text" value={urgency} onChange={e=>setUrgency(e.target.value)} /></label></div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
