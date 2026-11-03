'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [userId, setUserId] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: isRegistering ? name : undefined }),
      })

      const data = await response.json()

      if (response.ok) {
        setUserId(data.user.id)
        setIsLoggedIn(true)
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('An error occurred')
    }
  }

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="flex justify-between items-center mb-12">
            <h1 className="text-3xl font-bold text-white">SecureShare</h1>
            <button
              onClick={() => { setIsLoggedIn(false); setUserId('') }}
              className="text-white hover:text-blue-200"
            >
              Logout
            </button>
          </header>

          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload & Share Files</h2>

            <UploadSection userId={userId} />
            <FileList userId={userId} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">SecureShare</h1>
          <p className="text-center text-gray-600 mb-8">End-to-end encrypted file sharing</p>

          <div className="flex mb-6">
            <button
              onClick={() => setIsRegistering(false)}
              className={`flex-1 py-2 text-center ${!isRegistering ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-2 text-center ${isRegistering ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function UploadSection({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null)
  const [keyExport, setKeyExport] = useState<string>('')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const key = await generateKey()
      setEncryptionKey(key)
      const exported = await exportKey(key)
      setKeyExport(exported)
    }
  }

  const handleUpload = async () => {
    if (!file || !encryptionKey || !keyExport) return

    setUploading(true)

    try {
      const { encryptedData, iv } = await encryptFile(file, encryptionKey)

      const encryptedBlob = new Blob([encryptedData], { type: 'application/octet-stream' })
      const formData = new FormData()
      formData.append('file', encryptedBlob)
      formData.append('userId', userId)
      formData.append('encryptionKey', keyExport)
      formData.append('iv', JSON.stringify(Array.from(iv)))

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        alert('File uploaded successfully!')
        setFile(null)
        setEncryptionKey(null)
        setKeyExport('')
        window.location.reload()
      } else {
        alert('Upload failed')
      }
    } catch (error) {
      alert('Upload error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mb-8 p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload File</h3>
      <input
        type="file"
        onChange={handleFileSelect}
        className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {file && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {uploading ? 'Encrypting & Uploading...' : 'Upload Encrypted File'}
          </button>
        </div>
      )}
    </div>
  )
}

function FileList({ userId }: { userId: string }) {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadFiles = async () => {
    try {
      const response = await fetch(`/api/files/list?userId=${userId}`)
      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [])

  const handleShare = async (fileId: string) => {
    const password = prompt('Enter password (optional, leave empty for no password):')
    const hours = prompt('Expiration in hours (optional, leave empty for no expiration):')
    const maxDownloads = prompt('Max downloads (optional, leave empty for unlimited):')

    try {
      const response = await fetch('/api/files/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          userId,
          password: password || undefined,
          expiresAt: hours ? new Date(Date.now() + parseInt(hours) * 60 * 60 * 1000).toISOString() : undefined,
          maxDownloads: maxDownloads ? parseInt(maxDownloads) : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const shareUrl = `${window.location.origin}/share/${data.share.shareToken}`
        alert(`Share link created:\n${shareUrl}`)
      } else {
        alert(data.error)
      }
    } catch (error) {
      alert('Error creating share')
    }
  }

  if (loading) {
    return <div className="text-center text-gray-600">Loading files...</div>
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Files</h3>
      {files.length === 0 ? (
        <p className="text-gray-600">No files uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{file.originalName}</p>
                <p className="text-sm text-gray-600">
                  {(file.fileSize / 1024).toFixed(2)} KB • {new Date(file.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  {file.shares.length} active share(s) • {file._count.accessLogs} access log(s)
                </p>
              </div>
              <button
                onClick={() => handleShare(file.id)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Share
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

async function generateKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}

async function encryptFile(file: File, key: CryptoKey): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12))
  const fileBuffer = await file.arrayBuffer()
  const encryptedData = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    fileBuffer
  )
  return { encryptedData, iv }
}

async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('jwk', key)
  return JSON.stringify(exported)
}
