import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateShareToken } from '@/lib/crypto'

export async function POST(request: NextRequest) {
  try {
    const { fileId, userId, password, expiresAt, maxDownloads } = await request.json()

    if (!fileId || !userId) {
      return NextResponse.json(
        { error: 'File ID and User ID are required' },
        { status: 400 }
      )
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId },
    })

    if (!file || file.userId !== userId) {
      return NextResponse.json(
        { error: 'File not found or unauthorized' },
        { status: 404 }
      )
    }

    const shareToken = await generateShareToken()

    const share = await prisma.share.create({
      data: {
        fileId,
        userId,
        shareToken,
        password: password || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxDownloads: maxDownloads || 0,
      },
    })

    await prisma.accessLog.create({
      data: {
        fileId,
        userId,
        shareId: share.id,
        action: 'SHARE_CREATED',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json(
      {
        share: {
          id: share.id,
          shareToken: share.shareToken,
          expiresAt: share.expiresAt,
          maxDownloads: share.maxDownloads,
          hasPassword: !!share.password,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Share error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
