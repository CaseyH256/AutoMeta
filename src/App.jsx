import React, { useState, useEffect } from 'react';
import { Tabs, Tab } from '@mui/material';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import '@fontsource/inter'; // For preview font
import './App.css';

// Tier check stub - change 'unlock123' to your real logic later
const isTierUnlocked = (tier) => {
  const license = localStorage.getItem('license');
  if (license === 'unlock123') return true;
  return tier === 1; // Default Tier 1
};

function App() {
  const [tab, setTab] = useState(0);
  const [theme, setTheme] = useState('system');
  const [metadata, setMetadata] = useState({
    title: '', description: '', keywords: '', // Basic
    creator: '', contactEmail: '', location: '', sublocation: '', province: '', countryCode: '',
    rights: '', usageTerms: '', intellectualGenre: '', sceneCodes: '', instructions: '',
    creditLine: '', modelRelease: 'No', propertyRelease: 'No', supplierID: '', // Advanced stock, Getty-esque
  });
  const [keywordSets, setKeywordSets] = useState([]); // Array of sets for LR smart filters/stock
  const [importSettings, setImportSettings] = useState({
    isRaw: true,
    includeTreatmentProfile: true, profile: 'Adobe Color',
    includeBasic: true, whiteBalance: 'As Shot', exposure: 0, contrast: 0, highlights: 0, shadows: 0, whites: 0, blacks: 0, texture: 0, clarity: 0, dehaze: 0, vibrance: 0, saturation: 0,
    includeCurve: true, parametricHighlights: 0, parametricLights: 0, parametricDarks: 0, parametricShadows: 0, pointCurve: [], // Array of {x:0-255, y:0-255}
    includeColor: true,
    colorHueRed: 0, colorSatRed: 0, colorLumRed: 0,
    colorHueOrange: 0, colorSatOrange: 0, colorLumOrange: 0,
    colorHueYellow: 0, colorSatYellow: 0, colorLumYellow: 0,
    colorHueGreen: 0, colorSatGreen: 0, colorLumGreen: 0,
    colorHueAqua: 0, colorSatAqua: 0, colorLumAqua: 0,
    colorHueBlue: 0, colorSatBlue: 0, colorLumBlue: 0,
    colorHuePurple: 0, colorSatPurple: 0, colorLumPurple: 0,
    colorHueMagenta: 0, colorSatMagenta: 0, colorLumMagenta: 0,
    includePointColor: false, // Stub - expand if needed with point defs
    includeColorGrading: true,
    gradingShadowsHue: 0, gradingShadowsSat: 0, gradingShadowsLum: 0,
    gradingMidtonesHue: 0, gradingMidtonesSat: 0, gradingMidtonesLum: 0,
    gradingHighlightsHue: 0, gradingHighlightsSat: 0, gradingHighlightsLum: 0,
    gradingGlobalHue: 0, gradingGlobalSat: 0, gradingGlobalLum: 0,
    includeDetail: true, sharpeningAmount: 40, sharpeningRadius: 1.0, sharpeningDetail: 25, sharpeningMask: 0,
    denoise: false, rawDetails: false, superResolution: false,
    luminanceNR: 0, luminanceDetail: 50, luminanceContrast: 0,
    colorNR: 25, colorDetail: 50, colorSmoothness: 50,
    includeLensCorrections: true, removeChromatic: true, enableProfile: true, manualDistortion: 0, manualVignetteAmount: 0, manualVignetteMidpoint: 50,
    includeTransform: true, uprightMode: 'Off', uprightTransforms: false, manualVertical: 0, manualHorizontal: 0, manualRotate: 0, manualScale: 100, manualAspect: 0, manualX: 0, manualY: 0,
    includeEffects: true, postCropVignetteAmount: 0, postCropVignetteMidpoint: 50, postCropVignetteStyle: 1, postCropVignetteHighlights: 0, grainAmount: 0, grainSize: 25, grainRoughness: 50,
    includeLensBlur: true, lensBlurEffects: false,
    includeRemove: true, removeReflections: false, removePeople: false, removeDust: false,
    includeProcessVersion: true, processVersion: 'Current', calibrationBluePrimary: 0, calibrationRedPrimary: 0, calibrationShadowTint: 0,
    includeHDR: true, hdrMode: 'Off', sdrSettings: false,
    includeAdvanced: true, supportAmountSlider: false,
    isoAdaptive: [{ iso: 100, luminanceNR: 0, sharpening: 40, colorNR: 25 }, { iso: 400, luminanceNR: 10, sharpening: 50, colorNR: 30 }], // Expanded with more fields
  });
  const [preview, setPreview] = useState({ metadata: '', keywords: '', import: '' });

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleExport = async (type) => {
    const lrPath = window.electronAPI.getStoreValue('lightroomPath');
    const basePath = lrPath ? window.electronAPI.pathJoin(lrPath, type === 'import' ? 'Develop Presets' : 'Metadata Presets') : '';
    const zip = new JSZip();
    if (type === 'metadata') {
      const xmp = generateMetadataXMP(metadata);
      zip.file('metadata_preset.xmp', xmp);
    } else if (type === 'keywords') {
      const lrkws = generateKeywordsLRKWS(keywordSets);
      zip.file('keywords.lrkws', lrkws);
    } else if (type === 'import') {
      const lrtemplate = generateImportLRTEMPLATE(importSettings);
      zip.file(`${importSettings.isRaw ? 'raw' : 'non-raw'}_import.lrtemplate`, lrtemplate);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${type}_preset.zip`);
    if (!lrPath) alert('Set LR path for auto-export!');
  };

  const updatePreview = () => {
    const metaPrev = Object.entries(metadata).filter(([k, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');
    const keyPrev = keywordSets.flat().join(', ');
    const importPrev = JSON.stringify(importSettings, null, 2);
    setPreview({ metadata: metaPrev, keywords: keyPrev, import: importPrev });
  };

  const generateMetadataXMP = (data) => `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/" xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
  <rdf:Description rdf:about="">
    <dc:title>${data.title}</dc:title>
    <dc:description>${data.description}</dc:description>
    <dc:subject>${data.keywords}</dc:subject>
    <dc:creator>${data.creator}</dc:creator>
    <photoshop:AuthorsPosition>${data.contactEmail}</photoshop:AuthorsPosition>
    <Iptc4xmpCore:Location>${data.location}</Iptc4xmpCore:Location>
    <Iptc4xmpCore:City>${data.sublocation}</Iptc4xmpCore:City>
    <Iptc4xmpCore:ProvinceState>${data.province}</Iptc4xmpCore:ProvinceState>
    <Iptc4xmpCore:CountryCode>${data.countryCode}</Iptc4xmpCore:CountryCode>
    <xmpRights:Marked>${data.rights}</xmpRights:Marked>
    <xmpRights:UsageTerms>${data.usageTerms}</xmpRights:UsageTerms>
    <photoshop:Category>${data.intellectualGenre}</photoshop:Category>
    <Iptc4xmpCore:Scene>${data.sceneCodes}</Iptc4xmpCore:Scene>
    <photoshop:Instructions>${data.instructions}</photoshop:Instructions>
    <photoshop:Credit>${data.creditLine}</photoshop:Credit>
    <xmp:ModelReleaseStatus>${data.modelRelease}</xmp:ModelReleaseStatus>
    <xmp:PropertyReleaseStatus>${data.propertyRelease}</xmp:PropertyReleaseStatus>
    <photoshop:SupplierID>${data.supplierID}</photoshop:SupplierID>
  </rdf:Description>
</rdf:RDF>`;

  const generateKeywordsLRKWS = (sets) => sets.map(set => set.join(', ')).join('\n');

  const generateImportLRTEMPLATE = (settings) => {
    let s = `
s = {
  id = "preset_id",
  internalName = "${settings.isRaw ? 'Raw' : 'Non-Raw'} Import",
  title = "${settings.isRaw ? 'Raw' : 'Non-Raw'} Import",
  type = "Develop",
  value = {
    settings = {
      ProcessVersion = "${settings.processVersion}",
      EnableColorAdjustments = true,
      EnableDetail: true,
    `;
    if (settings.includeTreatmentProfile) s += `CameraProfile = "${settings.profile}",\n`;
    if (settings.includeBasic) {
      s += `WhiteBalance = "${settings.whiteBalance}",\n`;
      s += `Exposure2012 = ${settings.exposure},\n`;
      s += `Contrast2012 = ${settings.contrast},\n`;
      s += `Highlights2012 = ${settings.highlights},\n`;
      s += `Shadows2012 = ${settings.shadows},\n`;
      s += `Whites2012 = ${settings.whites},\n`;
      s += `Blacks2012 = ${settings.blacks},\n`;
      s += `Texture = ${settings.texture},\n`;
      s += `Clarity2012 = ${settings.clarity},\n`;
      s += `Dehaze = ${settings.dehaze},\n`;
      s += `Vibrance = ${settings.vibrance},\n`;
      s += `Saturation = ${settings.saturation},\n`;
    }
    if (settings.includeCurve) {
      s += `ParametricHighlights = ${settings.parametricHighlights},\n`;
      s += `ParametricLights = ${settings.parametricLights},\n`;
      s += `ParametricDarks = ${settings.parametricDarks},\n`;
      s += `ParametricShadows = ${settings.parametricShadows},\n`;
      if (settings.pointCurve.length) s += `ToneCurvePV2012 = { ${settings.pointCurve.map(pt => `${pt.x}, ${pt.y}`).join(', ')} },\n`;
    }
    if (settings.includeColor) {
      s += `HueAdjustmentRed = ${settings.colorHueRed}, SaturationAdjustmentRed = ${settings.colorSatRed}, LuminanceAdjustmentRed = ${settings.colorLumRed},\n`;
      s += `HueAdjustmentOrange = ${settings.colorHueOrange}, SaturationAdjustmentOrange = ${settings.colorSatOrange}, LuminanceAdjustmentOrange = ${settings.colorLumOrange},\n`;
      s += `HueAdjustmentYellow = ${settings.colorHueYellow}, SaturationAdjustmentYellow = ${settings.colorSatYellow}, LuminanceAdjustmentYellow = ${settings.colorLumYellow},\n`;
      s += `HueAdjustmentGreen = ${settings.colorHueGreen}, SaturationAdjustmentGreen = ${settings.colorSatGreen}, LuminanceAdjustmentGreen = ${settings.colorLumGreen},\n`;
      s += `HueAdjustmentAqua = ${settings.colorHueAqua}, SaturationAdjustmentAqua = ${settings.colorSatAqua}, LuminanceAdjustmentAqua = ${settings.colorLumAqua},\n`;
      s += `HueAdjustmentBlue = ${settings.colorHueBlue}, SaturationAdjustmentBlue = ${settings.colorSatBlue}, LuminanceAdjustmentBlue = ${settings.colorLumBlue},\n`;
      s += `HueAdjustmentPurple = ${settings.colorHuePurple}, SaturationAdjustmentPurple = ${settings.colorSatPurple}, LuminanceAdjustmentPurple = ${settings.colorLumPurple},\n`;
      s += `HueAdjustmentMagenta = ${settings.colorHueMagenta}, SaturationAdjustmentMagenta = ${settings.colorSatMagenta}, LuminanceAdjustmentMagenta = ${settings.colorLumMagenta},\n`;
    }
    if (settings.includeColorGrading) {
      s += `ColorGradeShadowHue = ${settings.gradingShadowsHue}, ColorGradeShadowSat = ${settings.gradingShadowsSat}, ColorGradeShadowLum = ${settings.gradingShadowsLum},\n`;
      s += `ColorGradeMidtoneHue = ${settings.gradingMidtonesHue}, ColorGradeMidtoneSat = ${settings.gradingMidtonesSat}, ColorGradeMidtoneLum = ${settings.gradingMidtonesLum},\n`;
      s += `ColorGradeHighlightHue = ${settings.gradingHighlightsHue}, ColorGradeHighlightSat = ${settings.gradingHighlightsSat}, ColorGradeHighlightLum = ${settings.gradingHighlightsLum},\n`;
      s += `ColorGradeGlobalHue = ${settings.gradingGlobalHue}, ColorGradeGlobalSat = ${settings.gradingGlobalSat}, ColorGradeGlobalLum = ${settings.gradingGlobalLum},\n`;
    }
    if (settings.includeDetail) {
      s += `SharpenAmount = ${settings.sharpeningAmount}, SharpenRadius = ${settings.sharpeningRadius}, SharpenDetail = ${settings.sharpeningDetail}, SharpenEdgeMasking = ${settings.sharpeningMask},\n`;
      if (settings.denoise) s += `Denoise = true,\n`;
      if (settings.rawDetails) s += `RawDetails = true,\n`;
      if (settings.superResolution) s += `SuperResolution = true,\n`;
      s += `LuminanceSmoothing = ${settings.luminanceNR}, LuminanceNoiseReductionDetail = ${settings.luminanceDetail}, LuminanceNoiseReductionContrast = ${settings.luminanceContrast},\n`;
      s += `ColorNoiseReduction = ${settings.colorNR}, ColorNoiseReductionDetail = ${settings.colorDetail}, ColorNoiseReductionSmoothness = ${settings.colorSmoothness},\n`;
    }
    if (settings.includeLensCorrections) {
      if (settings.removeChromatic) s += `LensProfileChromaticAberrationEnable = 1,\n`;
      if (settings.enableProfile) s += `LensProfileEnable = 1,\n`;
      s += `LensManualDistortionAmount = ${settings.manualDistortion},\n`;
      s += `VignetteAmount = ${settings.manualVignetteAmount}, VignetteMidpoint = ${settings.manualVignetteMidpoint},\n`;
    }
    if (settings.includeTransform) {
      s += `Upright = "${settings.uprightMode}",\n`;
      if (settings.uprightTransforms) s += `UprightTransformCount = 1,\n`;
      s += `PerspectiveVertical = ${settings.manualVertical},\n`;
      s += `PerspectiveHorizontal = ${settings.manualHorizontal},\n`;
      s += `PerspectiveRotate = ${settings.manualRotate},\n`;
      s += `PerspectiveScale = ${settings.manualScale},\n`;
      s += `PerspectiveAspect = ${settings.manualAspect},\n`;
      s += `PerspectiveX = ${settings.manualX},\n`;
      s += `PerspectiveY = ${settings.manualY},\n`;
    }
    if (settings.includeEffects) {
      s += `PostCropVignetteAmount = ${settings.postCropVignetteAmount},\n`;
      s += `PostCropVignetteMidpoint = ${settings.postCropVignetteMidpoint},\n`;
      s += `PostCropVignetteStyle = ${settings.postCropVignetteStyle},\n`;
      s += `PostCropVignetteHighlightContrast = ${settings.postCropVignetteHighlights},\n`;
      s += `GrainAmount = ${settings.grainAmount},\n`;
      s += `GrainSize = ${settings.grainSize},\n`;
      s += `GrainFrequency = ${settings.grainRoughness},\n`;
    }
    if (settings.includeLensBlur) {
      if (settings.lensBlurEffects) s += `LensBlurEnable = true,\n`;
    }
    if (settings.includeRemove) {
      if (settings.removeReflections) s += `RemoveReflections = true,\n`;
      if (settings.removePeople) s += `RemovePeople = true,\n`;
      if (settings.removeDust) s += `RemoveDust = true,\n`;
    }
    if (settings.includeProcessVersion) {
      s += `BlueHue = ${settings.calibrationBluePrimary},\n`;
      s += `RedHue = ${settings.calibrationRedPrimary},\n`;
      s += `ShadowTint = ${settings.calibrationShadowTint},\n`;
    }
    if (settings.includeHDR) {
      s += `EnableHDR = ${settings.hdrMode === 'On' ? true : false},\n`;
      if (settings.sdrSettings) s += `SDRSettings = true,\n`;
    }
    if (settings.isoAdaptive.length > 1) {
      s += settings.isoAdaptive.map((pt, i) => `ISOAdaptive${i} = { iso = ${pt.iso}, LuminanceSmoothing = ${pt.luminanceNR}, Sharpness = ${pt.sharpening}, ColorNoiseReduction = ${pt.colorNR} }`).join(',\n') + '\n';
    }
    s += `
    }
  }
}`;
    return s;
  };

  // Helper to update ISO adaptive points
  const updateIsoPoint = (index, field, value) => {
    const newAdaptive = [...importSettings.isoAdaptive];
    newAdaptive[index][field] = parseInt(value) || 0;
    setImportSettings({ ...importSettings, isoAdaptive: newAdaptive });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setTheme('light')}>☀️</button>
        <button onClick={() => setTheme('dark')}>🌙</button>
        <button onClick={() => setTheme('system')}>🖥️</button>
      </div>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} className="gold-button">
        <Tab label="Metadata" />
        <Tab label="Keywords" disabled={!isTierUnlocked(1)} />
        <Tab label="Import Preset" disabled={!isTierUnlocked(2)} />
        <Tab label="Preview" />
      </Tabs>
      {tab === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}> // Grid for metadata fields
          <input type="text" placeholder="Title" value={metadata.title} onChange={e => setMetadata({...metadata, title: e.target.value})} title="Image title (IPTC Headline)" />
          <input type="text" placeholder="Description" value={metadata.description} onChange={e => setMetadata({...metadata, description: e.target.value})} title="Caption or abstract" />
          <input type="text" placeholder="Keywords" value={metadata.keywords} onChange={e => setMetadata({...metadata, keywords: e.target.value})} title="Comma-separated keywords" />
          <input type="text" placeholder="Creator" value={metadata.creator} onChange={e => setMetadata({...metadata, creator: e.target.value})} title="Author name" />
          <input type="text" placeholder="Contact Email" value={metadata.contactEmail} onChange={e => setMetadata({...metadata, contactEmail: e.target.value})} title="Creator's email" />
          <input type="text" placeholder="Location" value={metadata.location} onChange={e => setMetadata({...metadata, location: e.target.value})} title="Sublocation or venue" />
          <input type="text" placeholder="Sublocation" value={metadata.sublocation} onChange={e => setMetadata({...metadata, sublocation: e.target.value})} title="City or area" />
          <input type="text" placeholder="Province/State" value={metadata.province} onChange={e => setMetadata({...metadata, province: e.target.value})} title="State or province" />
          <input type="text" placeholder="Country Code" value={metadata.countryCode} onChange={e => setMetadata({...metadata, countryCode: e.target.value})} title="ISO country code" />
          <input type="text" placeholder="Rights" value={metadata.rights} onChange={e => setMetadata({...metadata, rights: e.target.value})} title="Copyright notice" />
          <input type="text" placeholder="Usage Terms" value={metadata.usageTerms} onChange={e => setMetadata({...metadata, usageTerms: e.target.value})} title="Licensing terms" />
          <input type="text" placeholder="Intellectual Genre" value={metadata.intellectualGenre} onChange={e => setMetadata({...metadata, intellectualGenre: e.target.value})} title="Content type (e.g., editorial)" />
          <input type="text" placeholder="Scene Codes" value={metadata.sceneCodes} onChange={e => setMetadata({...metadata, sceneCodes: e.target.value})} title="IPTC scene codes" />
          <input type="text" placeholder="Instructions" value={metadata.instructions} onChange={e => setMetadata({...metadata, instructions: e.target.value})} title="Special instructions for stock" />
          <input type="text" placeholder="Credit Line" value={metadata.creditLine} onChange={e => setMetadata({...metadata, creditLine: e.target.value})} title="Credit attribution" />
          <select value={metadata.modelRelease} onChange={e => setMetadata({...metadata, modelRelease: e.target.value})} title="Model release status">
            <option>No</option><option>Yes</option><option>Not Applicable</option>
          </select>
          <select value={metadata.propertyRelease} onChange={e => setMetadata({...metadata, propertyRelease: e.target.value})} title="Property release status">
            <option>No</option><option>Yes</option><option>Not Applicable</option>
          </select>
          <input type="text" placeholder="Supplier ID" value={metadata.supplierID} onChange={e => setMetadata({...metadata, supplierID: e.target.value})} title="Stock agency supplier ID (e.g., Getty)" />
          <button className="gold-button" onClick={updatePreview}>Update Preview</button>
        </div>
      )}
      {tab === 1 && (
        <div>
          <button onClick={() => setKeywordSets([...keywordSets, []])}>Add Keyword Set</button>
          {keywordSets.map((set, setIndex) => (
            <div key={setIndex}>
              <h4>Set {setIndex + 1}</h4>
              {set.map((kw, kwIndex) => (
                <input key={kwIndex} type="text" value={kw} onChange={e => {
                  const newSets = [...keywordSets];
                  newSets[setIndex][kwIndex] = e.target.value;
                  setKeywordSets(newSets);
                }} />
              ))}
              <button onClick={() => {
                const newSets = [...keywordSets];
                newSets[setIndex].push('');
                setKeywordSets(newSets);
              }}>Add Keyword</button>
            </div>
          ))}
          {/* CSV import stub - expand later */}
          <input type="file" accept=".csv" onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => {
                const csv = ev.target.result;
                const lines = csv.split('\n').map(line => line.split(',').map(k => k.trim()));
                setKeywordSets(lines.filter(set => set.length > 0));
              };
              reader.readAsText(file);
            }
          }} />
          <button className="gold-button" onClick={updatePreview}>Update Preview</button>
        </div>
      )}
      {tab === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}> // Grid for import fields
          <label>Raw Files? <input type="checkbox" checked={importSettings.isRaw} onChange={e => setImportSettings({...importSettings, isRaw: e.target.checked})} /></label>
          <label>Include Treatment & Profile <input type="checkbox" checked={importSettings.includeTreatmentProfile} onChange={e => setImportSettings({...importSettings, includeTreatmentProfile: e.target.checked})} /></label>
          {importSettings.includeTreatmentProfile && (
            <select value={importSettings.profile} onChange={e => setImportSettings({...importSettings, profile: e.target.value})}>
              <option>Adobe Color</option>
              <option>Adobe Landscape</option>
              <option>Adobe Portrait</option>
              <option>Adobe Standard</option>
              <option>Adobe Vivid</option>
              <option>Camera Faithful</option>
              <option>Camera Landscape</option>
              <option>Camera Neutral</option>
              <option>Camera Portrait</option>
              <option>Camera Standard</option>
              {/* Add more LR profiles as needed */}
            </select>
          )}
          <label>Include Basic <input type="checkbox" checked={importSettings.includeBasic} onChange={e => setImportSettings({...importSettings, includeBasic: e.target.checked})} /></label>
          {importSettings.includeBasic && (
            <>
              <select value={importSettings.whiteBalance} onChange={e => setImportSettings({...importSettings, whiteBalance: e.target.value})}>
                <option>As Shot</option>
                <option>Auto</option>
                <option>Daylight</option>
                <option>Cloudy</option>
                <option>Shade</option>
                <option>Tungsten</option>
                <option>Fluorescent</option>
                <option>Flash</option>
                <option>Custom</option>
              </select>
              <label>Exposure <input type="range" min="-5" max="5" step="0.01" value={importSettings.exposure} onChange={e => setImportSettings({...importSettings, exposure: parseFloat(e.target.value)})} /></label>
              <label>Contrast <input type="range" min="-100" max="100" value={importSettings.contrast} onChange={e => setImportSettings({...importSettings, contrast: parseInt(e.target.value)})} /></label>
              <label>Highlights <input type="range" min="-100" max="100" value={importSettings.highlights} onChange={e => setImportSettings({...importSettings, highlights: parseInt(e.target.value)})} /></label>
              <label>Shadows <input type="range" min="-100" max="100" value={importSettings.shadows} onChange={e => setImportSettings({...importSettings, shadows: parseInt(e.target.value)})} /></label>
              <label>Whites <input type="range" min="-100" max="100" value={importSettings.whites} onChange={e => setImportSettings({...importSettings, whites: parseInt(e.target.value)})} /></label>
              <label>Blacks <input type="range" min="-100" max="100" value={importSettings.blacks} onChange={e => setImportSettings({...importSettings, blacks: parseInt(e.target.value)})} /></label>
              <label>Texture <input type="range" min="-100" max="100" value={importSettings.texture} onChange={e => setImportSettings({...importSettings, texture: parseInt(e.target.value)})} /></label>
              <label>Clarity <input type="range" min="-100" max="100" value={importSettings.clarity} onChange={e => setImportSettings({...importSettings, clarity: parseInt(e.target.value)})} /></label>
              <label>Dehaze <input type="range" min="-100" max="100" value={importSettings.dehaze} onChange={e => setImportSettings({...importSettings, dehaze: parseInt(e.target.value)})} /></label>
              <label>Vibrance <input type="range" min="-100" max="100" value={importSettings.vibrance} onChange={e => setImportSettings({...importSettings, vibrance: parseInt(e.target.value)})} /></label>
              <label>Saturation <input type="range" min="-100" max="100" value={importSettings.saturation} onChange={e => setImportSettings({...importSettings, saturation: parseInt(e.target.value)})} /></label>
            </>
          )}
          <label>Include Curve <input type="checkbox" checked={importSettings.includeCurve} onChange={e => setImportSettings({...importSettings, includeCurve: e.target.checked})} /></label>
          {importSettings.includeCurve && (
            <>
              <label>Parametric Highlights <input type="range" min="-100" max="100" value={importSettings.parametricHighlights} onChange={e => setImportSettings({...importSettings, parametricHighlights: parseInt(e.target.value)})} /></label>
              <label>Parametric Lights <input type="range" min="-100" max="100" value={importSettings.parametricLights} onChange={e => setImportSettings({...importSettings, parametricLights: parseInt(e.target.value)})} /></label>
              <label>Parametric Darks <input type="range" min="-100" max="100" value={importSettings.parametricDarks} onChange={e => setImportSettings({...importSettings, parametricDarks: parseInt(e.target.value)})} /></label>
              <label>Parametric Shadows <input type="range" min="-100" max="100" value={importSettings.parametricShadows} onChange={e => setImportSettings({...importSettings, parametricShadows: parseInt(e.target.value)})} /></label>
              <div>Point Curve: Add points (x 0-255, y 0-255)</div>
              {/* Simple UI for points - add button to push {x:0, y:0} */}
              <button onClick={() => setImportSettings({...importSettings, pointCurve: [...importSettings.pointCurve, {x: 0, y: 0}]})}>Add Point</button>
              {importSettings.pointCurve.map((pt, i) => (
                <div key={i}>
                  <input type="number" min="0" max="255" value={pt.x} onChange={e => {
                    const newCurve = [...importSettings.pointCurve];
                    newCurve[i].x = parseInt(e.target.value);
                    setImportSettings({...importSettings, pointCurve: newCurve});
                  }} />
                  <input type="number" min="0" max="255" value={pt.y} onChange={e => {
                    const newCurve = [...importSettings.pointCurve];
                    newCurve[i].y = parseInt(e.target.value);
                    setImportSettings({...importSettings, pointCurve: newCurve});
                  }} />
                </div>
              ))}
            </>
          )}
          <label>Include Color Mixer <input type="checkbox" checked={importSettings.includeColor} onChange={e => setImportSettings({...importSettings, includeColor: e.target.checked})} /></label>
          {importSettings.includeColor && (
            <>
              <label>Red Hue <input type="range" min="-100" max="100" value={importSettings.colorHueRed} onChange={e => setImportSettings({...importSettings, colorHueRed: parseInt(e.target.value)})} /></label>
              <label>Red Sat <input type="range" min="-100" max="100" value={importSettings.colorSatRed} onChange={e => setImportSettings({...importSettings, colorSatRed: parseInt(e.target.value)})} /></label>
              <label>Red Lum <input type="range" min="-100" max="100" value={importSettings.colorLumRed} onChange={e => setImportSettings({...importSettings, colorLumRed: parseInt(e.target.value)})} /></label>
              <label>Orange Hue <input type="range" min="-100" max="100" value={importSettings.colorHueOrange} onChange={e => setImportSettings({...importSettings, colorHueOrange: parseInt(e.target.value)})} /></label>
              <label>Orange Sat <input type="range" min="-100" max="100" value={importSettings.colorSatOrange} onChange={e => setImportSettings({...importSettings, colorSatOrange: parseInt(e.target.value)})} /></label>
              <label>Orange Lum <input type="range" min="-100" max="100" value={importSettings.colorLumOrange} onChange={e => setImportSettings({...importSettings, colorLumOrange: parseInt(e.target.value)})} /></label>
              <label>Yellow Hue <input type="range" min="-100" max="100" value={importSettings.colorHueYellow} onChange={e => setImportSettings({...importSettings, colorHueYellow: parseInt(e.target.value)})} /></label>
              <label>Yellow Sat <input type="range" min="-100" max="100" value={importSettings.colorSatYellow} onChange={e => setImportSettings({...importSettings, colorSatYellow: parseInt(e.target.value)})} /></label>
              <label>Yellow Lum <input type="range" min="-100" max="100" value={importSettings.colorLumYellow} onChange={e => setImportSettings({...importSettings, colorLumYellow: parseInt(e.target.value)})} /></label>
              <label>Green Hue <input type="range" min="-100" max="100" value={importSettings.colorHueGreen} onChange={e => setImportSettings({...importSettings, colorHueGreen: parseInt(e.target.value)})} /></label>
              <label>Green Sat <input type="range" min="-100" max="100" value={importSettings.colorSatGreen} onChange={e => setImportSettings({...importSettings, colorSatGreen: parseInt(e.target.value)})} /></label>
              <label>Green Lum <input type="range" min="-100" max="100" value={importSettings.colorLumGreen} onChange={e => setImportSettings({...importSettings, colorLumGreen: parseInt(e.target.value)})} /></label>
              <label>Aqua Hue <input type="range" min="-100" max="100" value={importSettings.colorHueAqua} onChange={e => setImportSettings({...importSettings, colorHueAqua: parseInt(e.target.value)})} /></label>
              <label>Aqua Sat <input type="range" min="-100" max="100" value={importSettings.colorSatAqua} onChange={e => setImportSettings({...importSettings, colorSatAqua: parseInt(e.target.value)})} /></label>
              <label>Aqua Lum <input type="range" min="-100" max="100" value={importSettings.colorLumAqua} onChange={e => setImportSettings({...importSettings, colorLumAqua: parseInt(e.target.value)})} /></label>
              <label>Blue Hue <input type="range" min="-100" max="100" value={importSettings.colorHueBlue} onChange={e => setImportSettings({...importSettings, colorHueBlue: parseInt(e.target.value)})} /></label>
              <label>Blue Sat <input type="range" min="-100" max="100" value={importSettings.colorSatBlue} onChange={e => setImportSettings({...importSettings, colorSatBlue: parseInt(e.target.value)})} /></label>
              <label>Blue Lum <input type="range" min="-100" max="100" value={importSettings.colorLumBlue} onChange={e => setImportSettings({...importSettings, colorLumBlue: parseInt(e.target.value)})} /></label>
              <label>Purple Hue <input type="range" min="-100" max="100" value={importSettings.colorHuePurple} onChange={e => setImportSettings({...importSettings, colorHuePurple: parseInt(e.target.value)})} /></label>
              <label>Purple Sat <input type="range" min="-100" max="100" value={importSettings.colorSatPurple} onChange={e => setImportSettings({...importSettings, colorSatPurple: parseInt(e.target.value)})} /></label>
              <label>Purple Lum <input type="range" min="-100" max="100" value={importSettings.colorLumPurple} onChange={e => setImportSettings({...importSettings, colorLumPurple: parseInt(e.target.value)})} /></label>
              <label>Magenta Hue <input type="range" min="-100" max="100" value={importSettings.colorHueMagenta} onChange={e => setImportSettings({...importSettings, colorHueMagenta: parseInt(e.target.value)})} /></label>
              <label>Magenta Sat <input type="range" min="-100" max="100" value={importSettings.colorSatMagenta} onChange={e => setImportSettings({...importSettings, colorSatMagenta: parseInt(e.target.value)})} /></label>
              <label>Magenta Lum <input type="range" min="-100" max="100" value={importSettings.colorLumMagenta} onChange={e => setImportSettings({...importSettings, colorLumMagenta: parseInt(e.target.value)})} /></label>
            </>
          )}
          <label>Include Point Color <input type="checkbox" checked={importSettings.includePointColor} onChange={e => setImportSettings({...importSettings, includePointColor: e.target.checked})} /></label>
          {/* Point Color UI can be added similar to point curve if needed */}
          <label>Include Color Grading <input type="checkbox" checked={importSettings.includeColorGrading} onChange={e => setImportSettings({...importSettings, includeColorGrading: e.target.checked})} /></label>
          {importSettings.includeColorGrading && (
            <>
              <label>Shadows Hue <input type="range" min="-180" max="180" value={importSettings.gradingShadowsHue} onChange={e => setImportSettings({...importSettings, gradingShadowsHue: parseInt(e.target.value)})} /></label>
              <label>Shadows Sat <input type="range" min="0" max="100" value={importSettings.gradingShadowsSat} onChange={e => setImportSettings({...importSettings, gradingShadowsSat: parseInt(e.target.value)})} /></label>
              <label>Shadows Lum <input type="range" min="-100" max="100" value={importSettings.gradingShadowsLum} onChange={e => setImportSettings({...importSettings, gradingShadowsLum: parseInt(e.target.value)})} /></label>
              <label>Midtones Hue <input type="range" min="-180" max="180" value={importSettings.gradingMidtonesHue} onChange={e => setImportSettings({...importSettings, gradingMidtonesHue: parseInt(e.target.value)})} /></label>
              <label>Midtones Sat <input type="range" min="0" max="100" value={importSettings.gradingMidtonesSat} onChange={e => setImportSettings({...importSettings, gradingMidtonesSat: parseInt(e.target.value)})} /></label>
              <label>Midtones Lum <input type="range" min="-100" max="100" value={importSettings.gradingMidtonesLum} onChange={e => setImportSettings({...importSettings, gradingMidtonesLum: parseInt(e.target.value)})} /></label>
              <label>Highlights Hue <input type="range" min="-180" max="180" value={importSettings.gradingHighlightsHue} onChange={e => setImportSettings({...importSettings, gradingHighlightsHue: parseInt(e.target.value)})} /></label>
              <label>Highlights Sat <input type="range" min="0" max="100" value={importSettings.gradingHighlightsSat} onChange={e => setImportSettings({...importSettings, gradingHighlightsSat: parseInt(e.target.value)})} /></label>
              <label>Highlights Lum <input type="range" min="-100" max="100" value={importSettings.gradingHighlightsLum} onChange={e => setImportSettings({...importSettings, gradingHighlightsLum: parseInt(e.target.value)})} /></label>
              <label>Global Hue <input type="range" min="-180" max="180" value={importSettings.gradingGlobalHue} onChange={e => setImportSettings({...importSettings, gradingGlobalHue: parseInt(e.target.value)})} /></label>
              <label>Global Sat <input type="range" min="0" max="100" value={importSettings.gradingGlobalSat} onChange={e => setImportSettings({...importSettings, gradingGlobalSat: parseInt(e.target.value)})} /></label>
              <label>Global Lum <input type="range" min="-100" max="100" value={importSettings.gradingGlobalLum} onChange={e => setImportSettings({...importSettings, gradingGlobalLum: parseInt(e.target.value)})} /></label>
            </>
          )}
          <label>Include Detail <input type="checkbox" checked={importSettings.includeDetail} onChange={e => setImportSettings({...importSettings, includeDetail: e.target.checked})} /></label>
          {importSettings.includeDetail && (
            <>
              <label>Sharpening Amount <input type="range" min="0" max="150" value={importSettings.sharpeningAmount} onChange={e => setImportSettings({...importSettings, sharpeningAmount: parseInt(e.target.value)})} /></label>
              <label>Sharpening Radius <input type="range" min="0.5" max="3.0" step="0.1" value={importSettings.sharpeningRadius} onChange={e => setImportSettings({...importSettings, sharpeningRadius: parseFloat(e.target.value)})} /></label>
              <label>Sharpening Detail <input type="range" min="0" max="100" value={importSettings.sharpeningDetail} onChange={e => setImportSettings({...importSettings, sharpeningDetail: parseInt(e.target.value)})} /></label>
              <label>Sharpening Mask <input type="range" min="0" max="100" value={importSettings.sharpeningMask} onChange={e => setImportSettings({...importSettings, sharpeningMask: parseInt(e.target.value)})} /></label>
              <label>Denoise <input type="checkbox" checked={importSettings.denoise} onChange={e => setImportSettings({...importSettings, denoise: e.target.checked})} /></label>
              <label>Raw Details <input type="checkbox" checked={importSettings.rawDetails} onChange={e => setImportSettings({...importSettings, rawDetails: e.target.checked})} /></label>
              <label>Super Resolution <input type="checkbox" checked={importSettings.superResolution} onChange={e => setImportSettings({...importSettings, superResolution: e.target.checked})} /></label>
              <label>Luminance NR <input type="range" min="0" max="100" value={importSettings.luminanceNR} onChange={e => setImportSettings({...importSettings, luminanceNR: parseInt(e.target.value)})} /></label>
              <label>Luminance Detail <input type="range" min="0" max="100" value={importSettings.luminanceDetail} onChange={e => setImportSettings({...importSettings, luminanceDetail: parseInt(e.target.value)})} /></label>
              <label>Luminance Contrast <input type="range" min="0" max="100" value={importSettings.luminanceContrast} onChange={e => setImportSettings({...importSettings, luminanceContrast: parseInt(e.target.value)})} /></label>
              <label>Color NR <input type="range" min="0" max="100" value={importSettings.colorNR} onChange={e => setImportSettings({...importSettings, colorNR: parseInt(e.target.value)})} /></label>
              <label>Color Detail <input type="range" min="0" max="100" value={importSettings.colorDetail} onChange={e => setImportSettings({...importSettings, colorDetail: parseInt(e.target.value)})} /></label>
              <label>Color Smoothness <input type="range" min="0" max="100" value={importSettings.colorSmoothness} onChange={e => setImportSettings({...importSettings, colorSmoothness: parseInt(e.target.value)})} /></label>
            </>
          )}
          <label>Include Lens Corrections <input type="checkbox" checked={importSettings.includeLensCorrections} onChange={e => setImportSettings({...importSettings, includeLensCorrections: e.target.checked})} /></label>
          {importSettings.includeLensCorrections && (
            <>
              <label>Remove Chromatic Aberration <input type="checkbox" checked={importSettings.removeChromatic} onChange={e => setImportSettings({...importSettings, removeChromatic: e.target.checked})} /></label>
              <label>Enable Profile Corrections <input type="checkbox" checked={importSettings.enableProfile} onChange={e => setImportSettings({...importSettings, enableProfile: e.target.checked})} /></label>
              <label>Manual Distortion <input type="range" min="-100" max="100" value={importSettings.manualDistortion} onChange={e => setImportSettings({...importSettings, manualDistortion: parseInt(e.target.value)})} /></label>
              <label>Manual Vignette Amount <input type="range" min="-100" max="100" value={importSettings.manualVignetteAmount} onChange={e => setImportSettings({...importSettings, manualVignetteAmount: parseInt(e.target.value)})} /></label>
              <label>Manual Vignette Midpoint <input type="range" min="0" max="100" value={importSettings.manualVignetteMidpoint} onChange={e => setImportSettings({...importSettings, manualVignetteMidpoint: parseInt(e.target.value)})} /></label>
            </>
          )}
          <label>Include Transform <input type="checkbox" checked={importSettings.includeTransform} onChange={e => setImportSettings({...importSettings, includeTransform: e.target.checked})} /></label>
          {importSettings.includeTransform && (
            <>
              <select value={importSettings.uprightMode} onChange={e => setImportSettings({...importSettings, uprightMode: e.target.value})}>
                <option>Off</option>
                <option>Auto</option>
                <option>Level</option>
                <option>Vertical</option>
                <option>Full</option>
              </select>
              <label>Upright Transforms <input type="checkbox" checked={importSettings.uprightTransforms} onChange={e => setImportSettings({...importSettings, uprightTransforms: e.target.checked})} /></label>
              <label>Manual Vertical <input type="range" min="-100" max="100" value={importSettings.manualVertical} onChange={e => setImportSettings({...importSettings, manualVertical: parseInt(e.target.value)})} /></label>
              <label>Manual Horizontal <input type="range" min="-100" max="100" value={importSettings.manualHorizontal} onChange={e => setImportSettings({...importSettings, manualHorizontal: parseInt(e.target.value)})} /></label>
              <label>Manual Rotate <input type="range" min="-45" max="45" step="0.1" value={importSettings.manualRotate} onChange={e => setImportSettings({...importSettings, manualRotate: parseFloat(e.target.value)})} /></label>
              <label>Manual Scale <input type="range" min="50" max="150" value={importSettings.manualScale} onChange={e => setImportSettings({...importSettings, manualScale: parseInt(e.target.value)})} /></label>
              <label>Manual Aspect <input type="range" min="-100" max="100" value={importSettings.manualAspect} onChange={e => setImportSettings({...importSettings, manualAspect: parseInt(e.target.value)})} /></label>
              <label>Manual X <input type="range" min="-100" max="100" value={importSettings.manualX} onChange={e => setImportSettings({...importSettings, manualX: parseInt(e.target.value)})} /></label>
              <label>Manual Y <input type="range" min="-100" max="100" value={importSettings.manualY} onChange={e => setImportSettings({...importSettings, manualY: parseInt(e.target.value)})} /></label>
            </>
          )}
          <label>Include Effects <input type="checkbox" checked={importSettings.includeEffects} onChange={e => setImportSettings({...importSettings, includeEffects: e.target.checked})} /></label>
          {importSettings.includeEffects && (
            <>
              <label>Post-Crop Vignette Amount <input type="range" min="-100" max="100" value={importSettings.postCropVignetteAmount} onChange={e => setImportSettings({...importSettings, postCropVignetteAmount: parseInt(e.target.value)})} /></label>
              <label>Post-Crop Vignette Midpoint <input type="range" min="0" max="100" value={importSettings.postCropVignetteMidpoint} onChange={e => setImportSettings({...importSettings, postCropVignetteMidpoint: parseInt(e.target.value)})} /></label>
              <select value={importSettings.postCropVignetteStyle} onChange={e => setImportSettings({...importSettings, postCropVignetteStyle: parseInt(e.target.value)})}>
                <option value={1}>Highlight Priority</option>
                <option value={2}>Color Priority</option>
                <option value={3}>Paint Overlay</option>
              </select>
              <label>Post-Crop Vignette Highlights <input type="range" min="0" max="100" value={importSettings.postCropVignetteHighlights} onChange={e => setImportSettings({...importSettings, postCropVignetteHighlights: parseInt(e.target.value)})} /></label>
              <label>Grain Amount <input type="range" min="0" max="100" value={importSettings.grainAmount} onChange={e => setImportSettings({...importSettings, grainAmount: parseInt(e.target.value)})} /></label>
              <label>Grain Size <input type="range" min="0" max="100" value={importSettings.grainSize} onChange={e => setImportSettings({...importSettings, grainSize: parseInt(e.target.value)})} /></label>
              <label>Grain Roughness <input type="range" min="0" max="100" value={importSettings.grainRoughness} onChange={e => setImportSettings({...importSettings, grainRoughness: parseInt(e.target.value)})} /></label>
            </>
          )}
          <label>Include Lens Blur <input type="checkbox" checked={importSettings.includeLensBlur} onChange={e => setImportSettings({...importSettings, includeLensBlur: e.target.checked})} /></label>
          {importSettings.includeLensBlur && (
            <label>Lens Blur Effects <input type="checkbox" checked={importSettings.lensBlurEffects} onChange={e => setImportSettings({...importSettings, lensBlurEffects: e.target.checked})} /></label>
          )}
          <label>Include Remove <input type="checkbox" checked={importSettings.includeRemove} onChange={e => setImportSettings({...importSettings, includeRemove: e.target.checked})} /></label>
          {importSettings.includeRemove && (
            <>
              <label>Remove Reflections <input type="checkbox" checked={importSettings.removeReflections} onChange={e => setImportSettings({...importSettings, removeReflections: e.target.checked})} /></label>
              <label>Remove People <input type="checkbox" checked={importSettings.removePeople} onChange={e => setImportSettings({...importSettings, removePeople: e.target.checked})} /></label>
              <label>Remove Dust <input type="checkbox" checked={importSettings.removeDust} onChange={e => setImportSettings({...importSettings, removeDust: e.target.checked})} /></label>
            </>
          )}
          <label>Include Process Version <input type="checkbox" checked={importSettings.includeProcessVersion} onChange={e => setImportSettings({...importSettings, includeProcessVersion: e.target.checked})} /></label>
          {importSettings.includeProcessVersion && (
            <>
              <select value={importSettings.processVersion} onChange={e => setImportSettings({...importSettings, processVersion: e.target.value})}>
                <option>Current</option>
                <option>5.0</option>
                <option>4.0</option>
                <option>3.0</option>
                <option>2.0</option>
                <option>1.0</option>
              </select>
              <label>Blue Primary <input type="range" min="-100" max="100" value={importSettings.calibrationBluePrimary} onChange={e => setImportSettings({...importSettings, calibrationBluePrimary: parseInt(e.target.value)})} /></label>
              <label>Red Primary <input type="range" min="-100" max="100" value={importSettings.calibrationRedPrimary} onChange={e => setImportSettings({...importSettings, calibrationRedPrimary: parseInt(e.target.value)})} /></label>
              <label>Shadow Tint <input type="range" min="-100" max="100" value={importSettings.calibrationShadowTint} onChange={e => setImportSettings({...importSettings, calibrationShadowTint: parseInt(e.target.value)})} /></label>
            </>
          )}
          <label>Include HDR <input type="checkbox" checked={importSettings.includeHDR} onChange={e => setImportSettings({...importSettings, includeHDR: e.target.checked})} /></label>
          {importSettings.includeHDR && (
            <>
              <select value={importSettings.hdrMode} onChange={e => setImportSettings({...importSettings, hdrMode: e.target.value})}>
                <option>Off</option>
                <option>On</option>
              </select>
              <label>SDR Settings <input type="checkbox" checked={importSettings.sdrSettings} onChange={e => setImportSettings({...importSettings, sdrSettings: e.target.checked})} /></label>
            </>
          )}
          <label>Include Advanced <input type="checkbox" checked={importSettings.includeAdvanced} onChange={e => setImportSettings({...importSettings, includeAdvanced: e.target.checked})} /></label>
          {importSettings.includeAdvanced && (
            <label>Support Amount Slider <input type="checkbox" checked={importSettings.supportAmountSlider} onChange={e => setImportSettings({...importSettings, supportAmountSlider: e.target.checked})} /></label>
          )}
          <div>ISO Adaptive</div>
          {importSettings.isoAdaptive.map((pt, i) => (
            <div key={i}>
              <label>ISO <input type="number" value={pt.iso} onChange={e => updateIsoPoint(i, 'iso', e.target.value)} /></label>
              <label>Luminance NR <input type="range" min="0" max="100" value={pt.luminanceNR} onChange={e => updateIsoPoint(i, 'luminanceNR', e.target.value)} /></label>
              <label>Sharpening <input type="range" min="0" max="150" value={pt.sharpening} onChange={e => updateIsoPoint(i, 'sharpening', e.target.value)} /></label>
              <label>Color NR <input type="range" min="0" max="100" value={pt.colorNR} onChange={e => updateIsoPoint(i, 'colorNR', e.target.value)} /></label>
            </div>
          ))}
          <button onClick={() => setImportSettings({...importSettings, isoAdaptive: [...importSettings.isoAdaptive, {iso: 800, luminanceNR: 20, sharpening: 60, colorNR: 35}]})}>Add ISO Point</button>
          <button className="gold-button" onClick={updatePreview}>Update Preview</button>
        </div>
      )}
      {tab === 3 && (
        <div style={{ fontFamily: 'Inter', fontSize: '14px' }}>
          <h3>Metadata Preview (only changed fields)</h3>
          <pre>{preview.metadata || 'No changes'}</pre>
          <button className="gold-button" onClick={ () => handleExport('metadata')}>Export Metadata</button>
          <h3>Keywords Preview</h3>
          <pre>{preview.keywords || 'No keywords'}</pre>
          <button className="gold-button" onClick={ () => handleExport('keywords')}>Export Keywords</button>
          <h3>Import Preview</h3>
          <pre>{preview.import || 'No settings'}</pre>
          <button className="gold-button" onClick={ () => handleExport('import')}>Export Import Preset</button>
        </div>
      )}
    </div>
  );
}

export default App;