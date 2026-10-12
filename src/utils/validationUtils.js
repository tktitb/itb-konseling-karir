export function validateFullName(name) {
  const trimmed = (name || "").trim()
  if (!trimmed) {
    return {
      isValid: false,
      error: "Nama lengkap wajib diisi"
    }
  }

  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: "Nama lengkap minimal 3 karakter"
    }
  }

  if (!/[a-zA-Z]/.test(trimmed)) {
    return {
      isValid: false,
      error: "Nama lengkap harus mengandung huruf"
    }
  }

  return {
    isValid: true,
    cleanValue: trimmed
  }
}

export function sanitizeWhatsAppInput(raw) {
  if (raw === null || raw === undefined) return ""
  const str = String(raw).trim()
  if (!str) return ""

  let digits = str.replace(/\D/g, "")
  if (!digits) return ""

  if (digits.startsWith("6208")) {
    digits = "08" + digits.slice(4)
  } else if (digits.startsWith("628")) {
    digits = "08" + digits.slice(3)
  } else if (digits.startsWith("8")) {
    digits = "0" + digits
  }

  return digits.slice(0, 14)
}

export function formatWhatsAppDisplay(raw) {
  return sanitizeWhatsAppInput(raw)
}

export function validateWhatsApp(phone) {
  const raw = (phone || "").toString().trim()
  if (!raw) {
    return {
      isValid: false,
      error: "Nomor WhatsApp wajib diisi"
    }
  }

  const localNumber = sanitizeWhatsAppInput(raw)

  if (!localNumber.startsWith("08")) {
    return {
      isValid: false,
      error: "Nomor WhatsApp harus diawali 08 (contoh: 081234567890)"
    }
  }

  if (localNumber.length >= 3 && !/^08[1-9]/.test(localNumber)) {
    return {
      isValid: false,
      error: "Format awalan nomor WhatsApp tidak valid (contoh: 081234567890)"
    }
  }

  if (localNumber.length < 10) {
    return {
      isValid: false,
      error: "Nomor WhatsApp minimal 10 digit angka (contoh: 081234567890)"
    }
  }

  if (localNumber.length > 14) {
    return {
      isValid: false,
      error: "Nomor WhatsApp maksimal 14 digit angka"
    }
  }

  const repeatedPattern = /^(\d)\1{7,}$/
  if (repeatedPattern.test(localNumber.slice(2))) {
    return {
      isValid: false,
      error: "Nomor WhatsApp tidak valid (terdeteksi angka berulang tidak wajar)"
    }
  }

  const normalizedValue = "62" + localNumber.slice(1)

  return {
    isValid: true,
    cleanValue: localNumber,
    normalizedValue
  }
}

export function validateEmail(email, isRequired = true) {
  const trimmed = (email || "").trim()

  if (!trimmed) {
    if (isRequired) {
      return {
        isValid: false,
        error: "Alamat email wajib diisi"
      }
    }
    return {
      isValid: true,
      cleanValue: ""
    }
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: "Format email tidak valid (contoh: nama@domain.com)"
    }
  }

  return {
    isValid: true,
    cleanValue: trimmed.toLowerCase()
  }
}

export function validateAngkatan(angkatan, isRequired = false) {
  const trimmed = (angkatan || "").toString().trim()

  if (!trimmed) {
    if (isRequired) {
      return {
        isValid: false,
        error: "Tahun angkatan wajib diisi"
      }
    }
    return {
      isValid: true,
      cleanValue: ""
    }
  }

  const digits = trimmed.replace(/\D/g, "")
  if (digits.length === 4) {
    const year = parseInt(digits, 10)
    const currentYear = new Date().getFullYear()
    if (year < 2010 || year > currentYear + 2) {
      return {
        isValid: false,
        error: `Tahun angkatan harus antara 2010 dan ${currentYear + 1}`
      }
    }
    return {
      isValid: true,
      cleanValue: digits
    }
  }

  if (digits.length === 2) {
    return {
      isValid: true,
      cleanValue: "20" + digits
    }
  }

  return {
    isValid: false,
    error: "Tahun angkatan harus berupa 4 digit (contoh: 2022)"
  }
}

export function validateText(value, fieldLabel, minLength = 2, isRequired = true) {
  const trimmed = (value || "").trim()

  if (!trimmed) {
    if (isRequired) {
      return {
        isValid: false,
        error: `${fieldLabel} wajib diisi`
      }
    }
    return {
      isValid: true,
      cleanValue: ""
    }
  }

  if (trimmed.length < minLength) {
    return {
      isValid: false,
      error: `${fieldLabel} minimal ${minLength} karakter`
    }
  }

  return {
    isValid: true,
    cleanValue: trimmed
  }
}
