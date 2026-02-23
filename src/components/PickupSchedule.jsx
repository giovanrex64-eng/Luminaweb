import React, { useState } from 'react';
import { getProvinceCode, PROVINCIAS_LISTA } from '../utils/provinciasMap';
import { useEnvios } from '../hooks/useEnvios';

export default function PickupSchedule({ defaultCarrier = 'oca' }) {
  const { schedulePickup } = useEnvios();
  const [carrier, setCarrier] = useState(defaultCarrier);
  const [tracking, setTracking] = useState('');
  const [date, setDate] = useState('');
  const [timeFrom, setTimeFrom] = useState('09:00');
  const [timeTo, setTimeTo] = useState('12:00');
  const [totalPackages, setTotalPackages] = useState(1);
  const [totalWeight, setTotalWeight] = useState(1);
  const [weightUnit, setWeightUnit] = useState('KG');

  const [name, setName] = useState('Lumina Web');
  const [company, setCompany] = useState('Lumina');
  const [phone, setPhone] = useState('+549261000000');
  const [email, setEmail] = useState('envios@lumina.com');
  const [street, setStreet] = useState('Calle Principal');
  const [number, setNumber] = useState('100');
  const [city, setCity] = useState('Maipu');
  const [state, setState] = useState('MZ');
  const [postalCode, setPostalCode] = useState('5511');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const origin = {
      name,
      company,
      phone,
      email,
      street,
      number: String(number),
      city,
      state: state.length <= 3 ? state : getProvinceCode(state),
      country: 'AR',
      postalCode
    };

    const shipment = {
      carrier,
      trackingNumbers: tracking.split(',').map(t => t.trim()).filter(Boolean),
      pickup: {
        date,
        timeFrom,
        timeTo,
        totalPackages: Number(totalPackages),
        totalWeight: Number(totalWeight),
        weightUnit
      }
    };

    try {
      const res = await schedulePickup({ origin, shipment });
      setResult(res);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
      <h3 style={{ marginBottom: '0.75rem' }}>Programar Retiro (Pickup)</h3>
      <form onSubmit={onSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <label>
            Carrier
            <select value={carrier} onChange={e => setCarrier(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
              <option value="oca">OCA</option>
              <option value="andreani">Andreani</option>
              <option value="fedex">FedEx</option>
              <option value="dhl">DHL</option>
            </select>
          </label>
          <label>
            Tracking (coma-sep)
            <input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="TRK123,TRK456" style={{ width: '100%', padding: '0.5rem' }} />
          </label>

          <label>
            Fecha
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} required />
          </label>
          <div>
            <label>
              Desde
              <input type="time" value={timeFrom} onChange={e => setTimeFrom(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
            </label>
            <label style={{ marginTop: '0.5rem' }}>
              Hasta
              <input type="time" value={timeTo} onChange={e => setTimeTo(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
            </label>
          </div>

          <label>
            Paquetes
            <input type="number" min="1" value={totalPackages} onChange={e => setTotalPackages(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
          </label>
          <label>
            Peso total
            <input type="number" min="0.1" step="0.1" value={totalWeight} onChange={e => setTotalWeight(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
          </label>
          <label>
            Unidad
            <select value={weightUnit} onChange={e => setWeightUnit(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
              <option>KG</option>
              <option>LB</option>
            </select>
          </label>

          <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Dirección de retiro</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" style={{ padding: '0.5rem' }} />
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Empresa" style={{ padding: '0.5rem' }} />
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Teléfono" style={{ padding: '0.5rem' }} />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ padding: '0.5rem' }} />
              <input value={street} onChange={e => setStreet(e.target.value)} placeholder="Calle" style={{ padding: '0.5rem' }} />
              <input value={number} onChange={e => setNumber(e.target.value)} placeholder="Número" style={{ padding: '0.5rem' }} />
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="Ciudad" style={{ padding: '0.5rem' }} />
              <select value={state} onChange={e => setState(e.target.value)} style={{ padding: '0.5rem' }}>
                {PROVINCIAS_LISTA.map(p => (
                  <option key={p} value={getProvinceCode(p)}>{p}</option>
                ))}
              </select>
              <input value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="CP" style={{ padding: '0.5rem' }} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="submit" className="button" disabled={loading} style={{ padding: '0.6rem 1rem' }}>{loading ? 'Enviando...' : 'Programar Pickup'}</button>
        </div>
      </form>

      {result && (
        <pre style={{ marginTop: '1rem', background: '#f3f4f6', padding: '0.75rem', borderRadius: '6px', maxHeight: '220px', overflow: 'auto' }}>{JSON.stringify(result, null, 2)}</pre>
      )}
      {error && (
        <div style={{ marginTop: '1rem', color: '#b91c1c' }}>Error: {error}</div>
      )}
    </div>
  );
}
