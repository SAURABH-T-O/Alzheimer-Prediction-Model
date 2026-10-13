import React, { useState, useEffect } from 'react';
import { predictionSections, allPredictionFields } from '../prediction-field.js';

const authors = [
  { id: 'PROFESSOR', name: 'Dr. Ritesh Jha', role: 'FACULTY / SUPERVISOR', lead: true },
  { id: 'STUDENT-01', name: 'Saurabh Toppo', role: 'BTECH/10504/24' },
  { id: 'STUDENT-02', name: 'Himanshu Kumar Singh', role: 'BTECH/10535/24' },
  { id: 'STUDENT-03', name: 'Satyam Kumar', role: 'BTECH/10577/24' }
];

const technologies = [
  ['01', 'MACHINE LEARNING', 'Placeholder description for the neural architecture used by the AlzAI prediction system.'],
  ['02', 'DATA PROCESSING', 'Placeholder description for data preprocessing and feature preparation.'],
  ['03', 'BIOMARKER ANALYSIS', 'Placeholder description for neurological and cognitive feature analysis.'],
  ['04', 'PREDICTION ENGINE', 'Placeholder description for the final classification stage.']
];

function navigate(path) {
  location.hash = path;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function Header({ active = '' }) {
  const link = (href, label, key) => (
    <a
      className={`nav-link ${active === key ? 'is-active' : ''}`}
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
        <div className="page-kicker">{telemetry}</div>
        <h1 dangerouslySetInnerHTML={{ __html: title }} />
        {children}
      </main>
    </>
  );
}

function HudCard({ telemetry, title, children, extra = '' }) {
  return (
    <section className={`hud-card ${extra}`}>
      <span className="card-telemetry">{telemetry}</span>
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
      telemetry="SYS::ABOUT-01"
      title="EARLY DETECTION.<br>INTELLIGENT ANALYSIS."
    >
      <div className="wide-copy">
        <HudCard
          telemetry="SYSTEM::OVERVIEW"
          title="ALZAI IS AN EXPERIMENTAL INTELLIGENCE LAYER"
        >
          <p>
            Designed to analyze neurological biomarkers and assist in identifying patterns
            associated with early-stage cognitive decline.
          </p>
        </HudCard>
        <div className="metric-row">
          <HudCard telemetry="DIAG::01" title="SYSTEM PURPOSE">
            <b>EARLY DETECTION</b>
          </HudCard>
          <HudCard telemetry="DIAG::02" title="ANALYSIS MODE">
            <b>COGNITIVE PROFILING</b>
          </HudCard>
          <HudCard telemetry="DIAG::03" title="CURRENT STATUS">
            <b>RESEARCH PROTOTYPE</b>
          </HudCard>
        </div>
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
      telemetry="SYS::TECH-02"
      title="NEURAL<br>INTELLIGENCE STACK"
    >
      <div className="module-grid">
        {technologies.map(([id, title, text]) => (
          <HudCard key={id} telemetry={`MODULE::${id}`} title={title}>
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
      telemetry="SYS::AUTHORS-03"
      title="RESEARCH<br>OPERATORS"
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
  const baseUrl = window.ALZAI_CONFIG?.API_URL;
  if (!baseUrl) throw new Error('PREDICTION SERVICE URL NOT CONFIGURED.');
  const payload = Object.fromEntries(
    Object.entries(formData).map(([key, value]) => [key, Number(value)])
  );
  let response;
  try {
    response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/prediction/predict`, {
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

function PredictPage({ formData, setFormData, activeStep, setActiveStep, setResult }) {
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const step = Math.min(activeStep, predictionSections.length - 1);
  const section = predictionSections[step];
  const stepLabels = predictionSections.map((item) => item.label);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateVisibleSection = () => {
    let valid = true;
    const newErrors = { ...errors };

    section.fields.forEach((field) => {
      const value = formData[field.name];
      newErrors[field.name] = '';
      if (!value) {
        newErrors[field.name] = 'PLEASE COMPLETE THIS FIELD.';
        valid = false;
        return;
      }
      if (!field.options && (Number(value) < field.min || Number(value) > field.max)) {
        newErrors[field.name] = `PLEASE ENTER A VALUE FROM ${field.min} TO ${field.max}.`;
        valid = false;
      }
    });

    setErrors(newErrors);

    if (!valid) {
      setFormError('PLEASE REVIEW THE MARKED FIELDS BEFORE CONTINUING.');
    } else {
      setFormError('');
    }

    return valid;
  };

  const handleNext = () => {
    if (!validateVisibleSection()) return;
    setActiveStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const firstInvalid = predictionSections.findIndex((sec) =>
      sec.fields.some((field) => {
        const val = formData[field.name];
        return !val || (!field.options && (Number(val) < field.min || Number(val) > field.max));
      })
    );

    if (firstInvalid !== -1) {
      setActiveStep(firstInvalid);
      // Validate the newly active section so its errors are shown
      const invalidSec = predictionSections[firstInvalid];
      const newErrors = { ...errors };
      invalidSec.fields.forEach((field) => {
        const val = formData[field.name];
        newErrors[field.name] = '';
        if (!val) {
          newErrors[field.name] = 'PLEASE COMPLETE THIS FIELD.';
        } else if (!field.options && (Number(val) < field.min || Number(val) > field.max)) {
          newErrors[field.name] = `PLEASE ENTER A VALUE FROM ${field.min} TO ${field.max}.`;
        }
      });
      setErrors(newErrors);
      setFormError('PLEASE REVIEW THE MARKED FIELDS BEFORE CONTINUING.');
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

            <div className="assessment-grid">
              {section.fields.map(renderField)}
            </div>

            <div id="form-error" className="form-error" role="alert">
              {formError}
            </div>

            <footer className="assessment-actions">
              {step > 0 ? (
                <button
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
                  className="assessment-button primary"
                  type="button"
                  onClick={handleNext}
                >
                  Continue →
                </button>
              ) : (
                <button className="assessment-button primary" type="submit">
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
  const [displayProb, setDisplayProb] = useState(0);

  useEffect(() => {
    if (!result) {
      navigate('/predict');
      return;
    }

    const target = Number(result.probability);
    const started = performance.now();
    let animId;

    const draw = (now) => {
      const val = Math.min(target, target * ((now - started) / 900));
      setDisplayProb(val);
      if (val < target) {
        animId = requestAnimationFrame(draw);
      }
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [result]);

  if (!result) return null;

  const { probability, prediction } = result;

  return (
    <Shell
      active="predict"
      telemetry="SYS::RESULT-05　 ANALYSIS::COMPLETE"
      title="COGNITIVE<br>RISK PROFILE"
    >
      <div className="result-layout">
        <section className="gauge-card">
          <span>ALZHEIMER'S PROBABILITY</span>
          <div
            className="gauge"
            style={{ '--p': `${probability * 3.6}deg` }}
          >
            <strong id="probability">
              {displayProb.toFixed(1)}%
            </strong>
          </div>
          <b>MODEL INFERENCE COMPLETE</b>
        </section>
        <section className="result-data">
          <HudCard telemetry="RESULT::STATUS" title="ANALYSIS STATUS">
            <b>COMPLETE</b>
          </HudCard>
          <HudCard telemetry="RESULT::SOURCE" title="MODEL SOURCE">
            <b>BACKEND INFERENCE API</b>
          </HudCard>
          <HudCard telemetry="RESULT::INPUT" title="INPUT STATUS">
            <b>RECEIVED</b>
          </HudCard>
          <HudCard telemetry="RESULT::CLASS" title="PREDICTION CLASS">
            <b>{prediction}</b>
          </HudCard>
        </section>
      </div>

      <div className="demo-note">
        <b>RESEARCH PROTOTYPE</b>
        <br />
        This model output is not a medical diagnosis and must not be used as a
        substitute for clinical assessment.
      </div>

      <button
        className="hud-button"
        id="toggle-inputs"
        onClick={() => setShowInputs((prev) => !prev)}
      >
        {showInputs ? 'HIDE INPUT DATA' : 'VIEW INPUT DATA'}
      </button>

      <section
        className={`input-summary ${showInputs ? '' : 'hidden'}`}
        id="input-summary"
      >
        <h2>INPUT PARAMETERS</h2>
        {allPredictionFields.map((f) => (
          <p key={f.name}>
            <span>{f.label}</span>
            <b>{displayValue(f, formData[f.name])}</b>
          </p>
        ))}
      </section>

      <div className="button-row">
        <button
          className="hud-button primary"
          onClick={() => {
            onReset();
            navigate('/predict');
          }}
        >
          RUN NEW ANALYSIS
        </button>
        <button className="hud-button" onClick={() => navigate('/')}>
          RETURN TO SYSTEM
        </button>
      </div>
    </Shell>
  );
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(
    location.hash.replace('#', '') || '/'
  );
  const [formData, setFormData] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      const nextRoute = location.hash.replace('#', '') || '/';
      setCurrentRoute(nextRoute);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Parallax tilt on #brain-frame if present
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
  };

  return (
    <div key={currentRoute} className="page-enter">
      {currentRoute === '/' && <HomePage />}
      {currentRoute === '/about' && <AboutPage />}
      {currentRoute === '/technology' && <TechnologyPage />}
      {currentRoute === '/authors' && <AuthorsPage />}
      {currentRoute === '/predict' && (
        <PredictPage
          formData={formData}
          setFormData={setFormData}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          setResult={setResult}
        />
      )}
      {currentRoute === '/processing' && <ProcessingPage />}
      {currentRoute === '/prediction-result' && (
        <ResultPage
          result={result}
          formData={formData}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

