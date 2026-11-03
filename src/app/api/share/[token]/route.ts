import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/crypto'
import { readFile } from 'fs/promises'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    const { searchParams } = new URL(request.url)
    const password = searchParams.get('password')

    const share = await prisma.share.findUnique({
      where: { shareToken: token },
      include: {
        file: true,
      },
    })

    if (!share || !share.isActive) {
      return NextResponse.json(
        { error: 'Share not found or inactive' },
        { status: 404 }
      )
    }

    if (share.expiresAt && new Date() > share.expiresAt) {
      return NextResponse.json(
        { error: 'Share has expired' },
        { status: 410 }
      )
    }

    if (share.maxDownloads > 0 && share.downloadCount >= share.maxDownloads) {
      return NextResponse.json(
        { error: 'Maximum downloads reached' },
        { status: 410 }
      )
    }

    if (share.password) {
      if (!password) {
        return NextResponse.json(
          { error: 'Password required' },
          { status: 401 }
        )
      }

      const hashedPassword = await hashPassword(password)
      if (hashedPassword !== share.password) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        )
      }
    }

    const fileBuffer = await readFile(share.file.storagePath)

    await prisma.share.update({
      where: { id: share.id },
      data: { downloadCount: { increment: 1 } },
    })

    await prisma.accessLog.create({
      data: {
        fileId: share.fileId,
        shareId: share.id,
        action: 'DOWNLOAD',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${share.file.originalName}"`,
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
