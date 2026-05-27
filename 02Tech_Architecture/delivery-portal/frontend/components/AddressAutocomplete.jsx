'use client'
import { useEffect, useRef, useState } from 'react'
import { MapPin, Loader } from 'lucide-react'

let googleLoaded = false
let loadPromise = null

const loadGoogleMaps = (apiKey) => {
  if (googleLoaded) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps?.places) {
      googleLoaded = true
      return resolve()
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.onload = () => { googleLoaded = true; resolve() }
    script.onerror = reject
    document.head.appendChild(script)
  })

  return loadPromise
}

export default function AddressAutocomplete({ label, placeholder, value, onChange, required }) {
  const inputRef = useRef(null)
  const [ready, setReady] = useState(false)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

  useEffect(() => {
    // If no API key configured, just use plain input
    if (!apiKey || apiKey.includes('PASTE')) {
      setReady(true)
      return
    }

    loadGoogleMaps(apiKey).then(() => {
      if (!inputRef.current) return

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'in' },
        fields: ['formatted_address', 'name', 'geometry'],
        types: ['geocode', 'establishment'],
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        const address = place.formatted_address || place.name || inputRef.current.value
        onChange(address)
      })

      setReady(true)
    }).catch(() => setReady(true))
  }, [apiKey])

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-mac-secondary z-10 pointer-events-none" />
        {!ready && (
          <Loader size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-mac-secondary animate-spin" />
        )}
        <input
          ref={inputRef}
          type="text"
          className="input pl-9"
          placeholder={placeholder}
          defaultValue={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete="off"
        />
      </div>
      {(!apiKey || apiKey.includes('PASTE')) && (
        <p className="text-xs text-mac-secondary mt-1">
          💡 Add NEXT_PUBLIC_GOOGLE_MAPS_KEY to .env.local to enable address suggestions
        </p>
      )}
    </div>
  )
}
