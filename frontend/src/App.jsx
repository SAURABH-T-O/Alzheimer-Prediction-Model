import React, { useState, useEffect } from 'react';
import { predictionSections, allPredictionFields } from '../prediction-field.js';
import { parseQuickFill, validateFieldValue } from '../quickfill.js';

const authors = [
  { id: 'PROFESSOR', name: 'Dr. Ritesh Jha', role: 'FACULTY / SUPERVISOR', lead: true },
  { id: 'STUDENT-01', name: 'Saurabh Toppo', role: 'BTECH/10504/24' },
  { id: 'STUDENT-02', name: 'Himanshu Kumar Singh', role: 'BTECH/10535/24' },
  { id: 'STUDENT-03', name: 'Satyam Kumar', role: 'BTECH/10577/24' }
];

const technologies = [
  [
    '01',
    'NEURAL NETWORK MODELS',
    'Two custom PyTorch models: a feedforward ANN that analyzes 32 clinical biomarkers, and a Convolutional Neural Network (CNN) that classifies brain MRI scans into dementia stages.'
  ],
  [
    '02',
    'DATA & IMAGE PREPROCESSING',
    'Automated preprocessing using Scikit-learn to scale patient health numbers, and OpenCV with Torchvision to resize and prepare MRI images (224×224) for model inference.'
  ],
  [
    '03',
    'PYTHON ML MICROSERVICE',
    'A fast Python backend powered by FastAPI that validates user inputs with Pydantic, runs the PyTorch models in real time, and reports system health status.'
  ],
  [
    '04',
    'API GATEWAY & WEB INTERFACE',
    'A Node.js Express server that safely handles API requests and image uploads, connecting to a responsive React 19 single-page application with a futuristic HUD interface.'
  ]
];

function navigate(path) {
  location.hash = path;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function Header({ active = '' }) {
  const link = (href, label, key) => (
    <a
      className={`nav-link ${key === 'predict' ? 'nav-link-cta' : ''} ${active === key ? 'is-active' : ''}`}
      href={`#${href}`}
    >
      [{label}]
    </a>
  );

  return (
    <header className="hud-header">
      <a className="brand" href="#/" aria-label="AlzAI home">
        Alz<span>AI</span>
      </a>
      <nav>
        {link('/about', 'ABOUT', 'about')}
        {link('/technology', 'TECHNOLOGY USED', 'technology')}
        {link('/authors', 'AUTHORS', 'authors')}
        {link('/predict', 'PREDICT', 'predict')}
      </nav>
    </header>
  );
}

function Shell({ active, telemetry, title, children }) {
  return (
    <>
      <Header active={active} />
      <main className="page">
        {telemetry && <div className="page-kicker">{telemetry}</div>}
        <h1 dangerouslySetInnerHTML={{ __html: title }} />
        {children}
      </main>
    </>
  );
}

function HudCard({ telemetry, title, children, extra = '' }) {
  return (
    <section className={`hud-card ${extra}`}>
      {telemetry && <span className="card-telemetry">{telemetry}</span>}
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function HomePage() {
  return (
    <iframe
      src="home.html"
      title="AlzAI landing page"
      style={{
        position: 'relative',
        zIndex: 1,
        display: 'block',
        width: '100%',
        height: '100vh',
        minHeight: '100dvh',
        border: 0,
        background: '#0b0d0e'
      }}
    />
  );
}

function AboutPage() {
  return (
    <Shell
      active="about"
      title="EARLY DETECTION.<br>INTELLIGENT ANALYSIS."
    >
      <div className="wide-copy">
        <HudCard
          title="AI-POWERED COGNITIVE HEALTH ANALYSIS"
        >
          <p>
            AlzAI is a research platform designed for the early detection of Alzheimer’s disease.
            It uses artificial intelligence to evaluate cognitive risk through two pathways:
            everyday clinical health indicators and structural brain MRI scans.
          </p>
        </HudCard>
        <div className="metric-row">
          <HudCard title="SYSTEM PURPOSE">
            <b>EARLY DETECTION</b>
            <p>
              Identifies subtle patterns of cognitive decline before severe symptoms appear,
              supporting timely medical guidance.
            </p>
          </HudCard>
          <HudCard title="ANALYSIS MODES">
            <b>TWO INPUT MODES</b>
            <p>
              Allows flexible assessment using either 32 clinical health metrics or direct
              brain MRI scan image uploads.
            </p>
          </HudCard>
          <HudCard title="PRIVACY & PROTOCOL">
            <b>PRIVACY FIRST</b>
            <p>
              All inputs and images are processed in-memory and immediately discarded without
              storing anything in a database.
            </p>
          </HudCard>
        </div>
        <HudCard title="RESEARCH PROTOTYPE DISCLAIMER">
          <p>
            AlzAI is an academic research prototype. Results show estimated statistical risk and machine learning classifications for research purposes, not an official medical diagnosis.
          </p>
        </HudCard>
        <button className="hud-button" onClick={() => navigate('/')}>
          ← RETURN TO SYSTEM
        </button>
      </div>
    </Shell>
  );
}

function TechnologyPage() {
  return (
    <Shell
      active="technology"
      title="NEURAL<br>INTELLIGENCE STACK"
    >
      <div className="module-grid">
        {technologies.map(([id, title, text]) => (
          <HudCard key={id} title={title}>
            <p>{text}</p>
          </HudCard>
        ))}
      </div>
    </Shell>
  );
}

function AuthorsPage() {
  return (
    <Shell
      active="authors"
      title="AUTHORS"
    >
      <div className="authors">
        {authors.map((person) => (
          <HudCard
            key={person.id}
            telemetry={person.id}
            title={person.name}
            extra={person.lead ? 'lead' : ''}
          >
            <p>{person.role}</p>
          </HudCard>
        ))}
      </div>
    </Shell>
  );
}

function displayValue(field, value) {
  return field.options
    ? field.options.find((o) => o.value === String(value))?.label || value
    : value;
}

async function predictPatient(formData) {
  const baseUrl = window.ALZAI_CONFIG?.API_URL || '/api';
  const payload = Object.fromEntries(
    Object.entries(formData).map(([key, value]) => [key, Number(value)])
  );
  let response;
  try {
    response = await fetch(`${baseUrl.replace(/\/$/, '')}/prediction/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (_) {
    throw new Error('PREDICTION SERVICE UNAVAILABLE.');
  }
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) {
    throw new Error(body?.error?.message?.toUpperCase() || 'PREDICTION REQUEST FAILED.');
  }
  return {
    probability: body.data.probability,
    prediction: body.data.prediction,
    status: body.data.status,
    input: formData
  };
}

async function predictMriScan(file) {
  const baseUrl = window.ALZAI_CONFIG?.API_URL || '/api';
  let response;
  try {
    response = await fetch(`${baseUrl.replace(/\/$/, '')}/prediction/mri`, {
      method: 'POST',
      headers: {
        'Content-Type': file.type,
        'X-File-Name': file.name
      },
      body: file
    });
  } catch (_) {
    throw new Error('MRI PREDICTION SERVICE UNAVAILABLE.');
  }
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.success) {
    throw new Error(body?.error?.message?.toUpperCase() || body?.detail?.toUpperCase() || 'MRI PREDICTION REQUEST FAILED.');
  }
  return body.data;
}

function PredictionMethodPage() {
  return (
    <>
      <Header active="predict" />
      <main className="method-choice-page">
        <p className="method-choice-kicker">PREDICTION OPTIONS</p>
        <h1>Choose how you would like to continue</h1>
        <p className="method-choice-intro">Select one option to begin an Alzheimer’s risk assessment.</p>
        <section className="method-choice-grid" aria-label="Prediction methods">
          <article className="method-choice-card">
            <span className="method-choice-number" aria-hidden="true">01</span>
            <h2>Upload an MRI scan</h2>
            <p>Use an MRI image for brain-scan analysis.</p>
            <button className="assessment-button primary" type="button" onClick={() => navigate('/predict/mri')}>
              Upload MRI scan →
            </button>
          </article>
          <article className="method-choice-card">
            <span className="method-choice-number" aria-hidden="true">02</span>
            <h2>Fill medical information</h2>
            <p>Answer questions about health, lifestyle, and memory.</p>
            <button className="assessment-button primary" type="button" onClick={() => navigate('/predict/medical')}>
              Fill medical information →
            </button>
          </article>
        </section>
      </main>
    </>
  );
}

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function MriPredictionPage({ setMriResult }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const validateAndSetFile = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setSelectedFile(null);
      setError('PLEASE SELECT A JPEG, PNG, OR WEBP IMAGE.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSelectedFile(null);
      setError('THE IMAGE MUST BE 10 MB OR SMALLER.');
      return;
    }
    setSelectedFile(file);
    setError('');
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    validateAndSetFile(file);
    event.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('CHOOSE AN MRI IMAGE BEFORE CONTINUING.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const result = await predictMriScan(selectedFile);
      setMriResult(result);
      navigate('/mri-result');
    } catch (err) {
      setError(err.message || 'MRI PREDICTION SERVICE UNAVAILABLE.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header active="predict" />
      <main className="mri-upload-page">
        <p className="mri-upload-kicker">MRI SCAN ANALYSIS</p>
        <h1>Upload an MRI scan</h1>
        <p className="mri-upload-intro">Choose a scan image to continue with MRI-based analysis.</p>
        <section className="mri-simple-card">
          <h2>Select your scan image</h2>
          <p>Accepted formats: JPEG, PNG, or WebP. Maximum file size: 10 MB.</p>
          <form onSubmit={handleSubmit} noValidate>
            {!selectedFile ? (
              <label
                className={`mri-file-input ${isDragging ? 'is-dragging' : ''}`}
                htmlFor="mri-file"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="mri-upload-content">
                  <div className="mri-upload-icon-circle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <span className="mri-upload-primary">Choose MRI image</span>
                  <span className="mri-upload-hint">or drag and drop your scan here</span>
                </div>
                <input id="mri-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="mri-selected-card">
                <div className="mri-selected-preview">
                  <img src={previewUrl} alt="Selected MRI scan" />
                </div>
                <div className="mri-selected-details">
                  <span className="mri-selected-badge">✓ SCAN ATTACHED</span>
                  <div className="mri-selected-filename" title={selectedFile.name}>
                    {selectedFile.name}
                  </div>
                  <div className="mri-selected-meta">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type.split('/')[1]?.toUpperCase() || 'IMAGE'}
                  </div>
                  <div className="mri-selected-actions">
                    <label className="mri-action-change" htmlFor="mri-file-change">
                      Change scan
                      <input id="mri-file-change" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
                    </label>
                    <button type="button" className="mri-action-remove" onClick={handleRemove}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && <p className="mri-error" role="alert">{error}</p>}
            <div className="button-row">
              <button className="assessment-button secondary" type="button" onClick={() => navigate('/predict')}>
                ← Back
              </button>
              <button className="assessment-button primary" type="submit" disabled={isSubmitting || !selectedFile}>
                {isSubmitting ? 'Analyzing scan…' : 'Analyze scan →'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}

function validateSection(section, data) {
  const errors = {};
  let isValid = true;

  for (const field of section.fields) {
    errors[field.name] = validateFieldValue(field, data[field.name]);
    if (errors[field.name]) isValid = false;
  }

  return { isValid, errors };
}

function PredictPage({ formData, setFormData, activeStep, setActiveStep, setResult }) {
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [quickFillOpen, setQuickFillOpen] = useState(false);
  const [quickFillText, setQuickFillText] = useState('');
  const [quickFillMessage, setQuickFillMessage] = useState('');
  const [quickFillHasErrors, setQuickFillHasErrors] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('light-theme');
    document.body.classList.add('light-theme');
    return () => {
      document.documentElement.classList.remove('light-theme');
      document.body.classList.remove('light-theme');
    };
  }, []);

  const step = Math.min(activeStep, predictionSections.length - 1);
  const section = predictionSections[step];
  const stepLabels = predictionSections.map((item) => item.label);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleQuickFill = () => {
    const { updates, issues } = parseQuickFill(quickFillText);
    const importedNames = Object.keys(updates);

    if (importedNames.length > 0) {
      setFormData((previous) => ({ ...previous, ...updates }));
      setErrors((previous) => {
        const next = { ...previous };
        importedNames.forEach((name) => { next[name] = ''; });
        return next;
      });
    }

    setQuickFillHasErrors(issues.length > 0);
    if (importedNames.length > 0 && issues.length > 0) {
      setQuickFillMessage(`Imported ${importedNames.length} field(s). ${issues.join(' ')}`);
    } else if (importedNames.length > 0) {
      setQuickFillMessage(
        `Imported ${importedNames.length} field(s). Review each step, then generate prediction on the final step.`,
      );
    } else {
      setQuickFillMessage(issues.join(' '));
    }
  };

  const validateVisibleSection = () => {
    const { isValid, errors: nextErrors } = validateSection(section, formData);
    setErrors((prev) => ({ ...prev, ...nextErrors }));
    setFormError(isValid ? '' : 'PLEASE REVIEW THE MARKED FIELDS BEFORE CONTINUING.');
    return isValid;
  };

  const handleNext = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!validateVisibleSection()) return;
    setActiveStep((prev) => Math.min(predictionSections.length - 1, prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setActiveStep((prev) => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (step < predictionSections.length - 1) {
      handleNext(e);
      return;
    }

    const firstInvalidIndex = predictionSections.findIndex(
      (sec) => !validateSection(sec, formData).isValid
    );

    if (firstInvalidIndex !== -1) {
      setActiveStep(firstInvalidIndex);
      const { errors: nextErrors } = validateSection(predictionSections[firstInvalidIndex], formData);
      setErrors((prev) => ({ ...prev, ...nextErrors }));
      setFormError('PLEASE REVIEW THE MARKED FIELDS BEFORE CONTINUING.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const result = await predictPatient(formData);
      setResult(result);
      navigate('/processing');
    } catch (err) {
      setFormError(err.message || 'PREDICTION SERVICE UNAVAILABLE.');
    }
  };

  const renderField = (field) => {
    const value = formData[field.name] ?? '';

    if (field.options?.length === 2) {
      return (
        <fieldset key={field.name} className="assessment-field choice-field">
          <legend>
            {field.label}
            <span aria-hidden="true"> *</span>
          </legend>
          <p>{field.help}</p>
          <div className="choice-options">
            {field.options.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={String(value) === option.value}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  required
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <small
            className="input-error"
            id={`error-${field.name}`}
            aria-live="polite"
          >
            {errors[field.name] || ''}
          </small>
        </fieldset>
      );
    }

    const control = field.options ? (
      <select
        id={field.name}
        name={field.name}
        value={value}
        onChange={(e) => handleInputChange(field.name, e.target.value)}
        required
        aria-describedby={`help-${field.name} error-${field.name}`}
      >
        <option value="">Please select</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        id={field.name}
        name={field.name}
        type="number"
        inputMode="decimal"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={(e) => handleInputChange(field.name, e.target.value)}
        required
        aria-describedby={`help-${field.name} error-${field.name}`}
      />
    );

    const range = field.options
      ? 'Required selection'
      : `Expected range: ${field.min} to ${field.max}`;

    return (
      <div key={field.name} className="assessment-field">
        <label htmlFor={field.name}>
          {field.label}
          <span aria-hidden="true"> *</span>
        </label>
        <p id={`help-${field.name}`}>{field.help}</p>
        {control}
        <small className="field-range">{range}</small>
        <small
          className="input-error"
          id={`error-${field.name}`}
          aria-live="polite"
        >
          {errors[field.name] || ''}
        </small>
      </div>
    );
  };

  return (
    <>
      <Header active="predict" />
      <main className="assessment-page">
        <section className="assessment-heading">
          <div className="assessment-icon" aria-hidden="true">
            🧠
          </div>
          <div>
            <p className="assessment-eyebrow">COGNITIVE HEALTH SCREENING</p>
            <h1>Alzheimer's Risk Assessment</h1>
            <p className="assessment-subtitle">
              Provide the following information to estimate your cognitive health risk.
            </p>
          </div>
        </section>

        <p className="assessment-disclaimer">
          <strong>Important:</strong> This assessment is for informational purposes and is
          not a medical diagnosis.
        </p>

        <form id="prediction-form" noValidate onSubmit={handleSubmit}>
          <section className="assessment-card" aria-labelledby="current-step">
            <div className="step-summary">
              <p id="current-step">
                Step {step + 1} of {predictionSections.length}
              </p>
              <strong>
                {Math.round(((step ) / predictionSections.length) * 100)}% complete
              </strong>
            </div>
            <ol className="assessment-stepper">
              {stepLabels.map((label, index) => (
                <li
                  key={label}
                  className={
                    index === step
                      ? 'is-current'
                      : index < step
                      ? 'is-complete'
                      : ''
                  }
                  style={{
                    cursor: index < step || Object.keys(formData).length >= 5 ? 'pointer' : 'default',
                    userSelect: 'none'
                  }}
                  onClick={() => {
                    if (index < step || Object.keys(formData).length >= 5) {
                      setActiveStep(index);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  {...(index === step ? { 'aria-current': 'step' } : {})}
                >
                  <span>{index < step ? '✓' : index + 1}</span>
                  <b>{label}</b>
                </li>
              ))}
            </ol>
          </section>

          <section
            className="assessment-card assessment-form-card"
            aria-labelledby="section-title"
          >
            <header>
              <p className="assessment-eyebrow">STEP {step + 1}</p>
              <h2 id="section-title">{section.label}</h2>
              <p>{section.description}</p>
            </header>

            <section className="quickfill-card" aria-labelledby="quickfill-title">
              <div className="quickfill-heading">
                <div>
                  <h3 id="quickfill-title">QuickFill</h3>
                  <p>Paste JSON using the form field names. Fields you leave out will keep their current values.</p>
                </div>
                <button
                  className="assessment-button secondary quickfill-toggle"
                  type="button"
                  aria-expanded={quickFillOpen}
                  aria-controls="quickfill-panel"
                  onClick={() => setQuickFillOpen((open) => !open)}
                >
                  {quickFillOpen ? 'Close QuickFill' : 'QuickFill'}
                </button>
              </div>
              {quickFillOpen && (
                <div id="quickfill-panel" className="quickfill-panel">
                  <label htmlFor="quickfill-json">JSON field values</label>
                  <textarea
                    id="quickfill-json"
                    value={quickFillText}
                    onChange={(event) => setQuickFillText(event.target.value)}
                    placeholder={'{\n  "Age": 72,\n  "Gender": 0,\n  "MMSE": 25\n}'}
                    rows={7}
                    spellCheck="false"
                  />
                  <button
                    className="assessment-button primary"
                    type="button"
                    onClick={handleQuickFill}
                  >
                    Import &amp; Fill Form
                  </button>
                  <p
                    className={`quickfill-message${quickFillHasErrors ? ' has-errors' : ''}`}
                    role="status"
                    aria-live="polite"
                  >
                    {quickFillMessage}
                  </p>
                </div>
              )}
            </section>

            <div className="assessment-grid">
              {section.fields.map(renderField)}
            </div>

            <div id="form-error" className="form-error" role="alert">
              {formError}
            </div>

            <footer className="assessment-actions">
              {step > 0 ? (
                <button
                  key="btn-prev"
                  className="assessment-button secondary"
                  type="button"
                  onClick={handlePrev}
                >
                  ← Back
                </button>
              ) : (
                <span></span>
              )}

              {step < predictionSections.length - 1 ? (
                <button
                  key={`btn-next-${step}`}
                  className="assessment-button primary"
                  type="button"
                  onClick={handleNext}
                >
                  Continue →
                </button>
              ) : (
                <button
                  key="btn-submit"
                  className="assessment-button primary"
                  type="submit"
                >
                  Generate Prediction →
                </button>
              )}
            </footer>
          </section>
        </form>
      </main>
    </>
  );
}

function ProcessingPage() {
  const [progress, setProgress] = useState(0);
  const messages = [
    'INITIALIZING ANALYSIS...',
    'FEATURE VECTOR INITIALIZED',
    'NEURAL PATTERN ANALYSIS...',
    'MODEL INFERENCE...',
    'RESULT READY'
  ];

  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current += 2;
      setProgress(current);
      if (current >= 100) {
        clearInterval(timer);
        setTimeout(() => navigate('/prediction-result'), 350);
      }
    }, 36);

    return () => clearInterval(timer);
  }, []);

  const messageIndex = Math.min(4, Math.floor(progress / 20));

  return (
    <>
      <Header active="predict" />
      <main className="processing">
        <div className="processing-core">
          <span>SYS::PREDICT-04</span>
          <h1>
            ANALYZING
            <br />
            FEATURE VECTOR
          </h1>
          <div className="progress">
            <i id="progress-bar" style={{ width: `${progress}%` }}></i>
          </div>
          <p id="process-message">{messages[messageIndex]}</p>
          <small id="process-percent">
            {String(progress).padStart(2, '0')}%
          </small>
        </div>
      </main>
    </>
  );
}

function ResultPage({ result, formData, onReset }) {
  const [showInputs, setShowInputs] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('light-theme');
    document.body.classList.add('light-theme');
    return () => {
      document.documentElement.classList.remove('light-theme');
      document.body.classList.remove('light-theme');
    };
  }, []);

  useEffect(() => {
    if (!result) {
      navigate('/predict');
    }
  }, [result]);

  if (!result) return null;

  const { probability, prediction } = result;

  return (
    <>
      <Header active="predict" />
      <main className="assessment-page result-page">
        <section className="assessment-heading">
          <div className="assessment-icon" aria-hidden="true">✓</div>
          <div>
            <p className="assessment-eyebrow">ASSESSMENT COMPLETE</p>
            <h1>Prediction Result</h1>
            <p className="assessment-subtitle">Here is the estimate returned by the prediction model.</p>
          </div>
        </section>

        <section className="result-card" aria-labelledby="result-score-title">
          <p className="assessment-eyebrow">MODEL ESTIMATE</p>
          <h2 id="result-score-title">Alzheimer's probability</h2>
          <p className="result-score">{Number(probability).toFixed(1)}<span>%</span></p>
          <p className="result-class">Model output class: <strong>{prediction}</strong></p>
          <p className="result-disclaimer">
            This is a model-generated estimate, not a medical diagnosis. Discuss health concerns and assessment results with a qualified healthcare professional.
          </p>
        </section>

        <section className="result-details-card">
          <button
            className="assessment-button secondary"
            type="button"
            aria-expanded={showInputs}
            aria-controls="input-summary"
            onClick={() => setShowInputs((previous) => !previous)}
          >
            {showInputs ? 'Hide entered information' : 'Review entered information'}
          </button>
          {showInputs && (
            <dl className="input-summary" id="input-summary">
              {allPredictionFields.map((field) => (
                <div key={field.name}>
                  <dt>{field.label}</dt>
                  <dd>{displayValue(field, formData[field.name])}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        <div className="result-actions">
          <button
            className="assessment-button primary"
            type="button"
            onClick={() => {
              onReset();
              navigate('/predict');
            }}
          >
            Start a new assessment
          </button>
          <button
            className="assessment-button secondary"
            type="button"
            onClick={() => navigate('/')}
          >
            Return to home
          </button>
        </div>
      </main>
    </>
  );
}

function MriResultPage({ result, onReset }) {
  useEffect(() => {
    if (!result) navigate('/predict/mri');
  }, [result]);

  if (!result) return null;

  return (
    <>
      <Header active="predict" />
      <main className="assessment-page result-page">
        <section className="assessment-heading">
          <div className="assessment-icon" aria-hidden="true">✓</div>
          <div>
            <p className="assessment-eyebrow">MRI ANALYSIS COMPLETE</p>
            <h1>Scan Result</h1>
            <p className="assessment-subtitle">Here is the classification returned by the MRI model.</p>
          </div>
        </section>
        <section className="result-card" aria-labelledby="mri-result-title">
          <p className="assessment-eyebrow">MRI MODEL OUTPUT</p>
          <h2 id="mri-result-title">{result.predictedStage}</h2>
          <p className="result-class">Dementia detected by model: <strong>{result.dementiaDetected}</strong></p>
          <p className="result-disclaimer">This is a model-generated classification, not a medical diagnosis. Discuss scan results and health concerns with a qualified healthcare professional.</p>
        </section>
        <div className="result-actions">
          <button className="assessment-button primary" type="button" onClick={() => { onReset(); navigate('/predict/mri'); }}>
            Analyze another MRI
          </button>
          <button className="assessment-button secondary" type="button" onClick={() => navigate('/predict')}>
            Choose prediction method
          </button>
        </div>
      </main>
    </>
  );
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(
    location.hash.replace('#', '') || '/'
  );
  const [formData, setFormData] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState(null);
  const [mriResult, setMriResult] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      const nextRoute = location.hash.replace('#', '') || '/';
      setCurrentRoute(nextRoute);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const frame = document.querySelector('#brain-frame');
    if (!frame) return;

    const onPointerMove = (event) => {
      const r = frame.getBoundingClientRect();
      frame.style.setProperty(
        '--rx',
        `${((event.clientY - r.top) / r.height - 0.5) * -8}deg`
      );
      frame.style.setProperty(
        '--ry',
        `${((event.clientX - r.left) / r.width - 0.5) * 10}deg`
      );
    };

    frame.addEventListener('pointermove', onPointerMove);
    return () => frame.removeEventListener('pointermove', onPointerMove);
  }, [currentRoute]);

  const handleReset = () => {
    setFormData({});
    setActiveStep(0);
    setResult(null);
    setMriResult(null);
  };

  return (
    <div key={currentRoute} className="page-enter">
      {currentRoute === '/' && <HomePage />}
      {currentRoute === '/about' && <AboutPage />}
      {currentRoute === '/technology' && <TechnologyPage />}
      {currentRoute === '/authors' && <AuthorsPage />}
      {currentRoute === '/predict' && <PredictionMethodPage />}
      {currentRoute === '/predict/medical' && (
        <PredictPage
          formData={formData}
          setFormData={setFormData}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          setResult={setResult}
        />
      )}
      {currentRoute === '/predict/mri' && <MriPredictionPage setMriResult={setMriResult} />}
      {currentRoute === '/processing' && <ProcessingPage />}
      {currentRoute === '/prediction-result' && (
        <ResultPage
          result={result}
          formData={formData}
          onReset={handleReset}
        />
      )}
      {currentRoute === '/mri-result' && (
        <MriResultPage result={mriResult} onReset={() => setMriResult(null)} />
      )}
    </div>
  );
}

