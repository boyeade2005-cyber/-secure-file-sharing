import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const encryptionKey = formData.get('encryptionKey') as string
    const iv = formData.get('iv') as string

    if (!file || !userId || !encryptionKey || !iv) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = join(process.cwd(), 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const fileId = crypto.randomUUID()
    const fileName = `${fileId}.enc`
    const filePath = join(uploadsDir, fileName)

    await writeFile(filePath, buffer)

    const dbFile = await prisma.file.create({
      data: {
        id: fileId,
        userId,
        fileName,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        encryptionKey,
        iv,
        storagePath: filePath,
      },
    })

    await prisma.accessLog.create({
      data: {
        fileId: dbFile.id,
        userId,
        action: 'UPLOAD',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json(
      {
        file: {
          id: dbFile.id,
          originalName: dbFile.originalName,
          fileSize: dbFile.fileSize,
          mimeType: dbFile.mimeType,
          createdAt: dbFile.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
