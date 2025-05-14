import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch admin data
export async function GET() {
  try {
    // Get total counts
    const [totalGames, totalResumes, totalAnswers] = await Promise.all([
      prisma.game.count(),
      prisma.resume.count(),
      prisma.userAnswer.count(),
    ]);

    // Calculate AI accuracy
    const userAnswers = await prisma.userAnswer.findMany({
      include: {
        resume: true
      }
    });

    const correctGuesses = userAnswers.filter(
      answer => answer.isAI === answer.resume.isAIGenerated
    ).length;

    const aiAccuracy = totalAnswers > 0 ? Math.round((correctGuesses / totalAnswers) * 100) : 0;

    // Calculate user agreement with AI scores
    const agreedScores = await prisma.userAnswer.count({
      where: {
        agreeScore: true
      }
    });

    const userAgreement = totalAnswers > 0 ? Math.round((agreedScores / totalAnswers) * 100) : 0;

    // Get recent games with all related data
    const games = await prisma.game.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        jobPosition: true,
        resumes: {
          include: {
            userAnswers: true
          }
        },
        surveyAnswer: true
      }
    });

    return NextResponse.json({
      stats: {
        totalGames,
        totalResumes,
        totalAnswers,
        aiAccuracy,
        userAgreement
      },
      games
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin data' },
      { status: 500 }
    );
  }
}

// POST - Create new record
export async function POST(request: Request) {
  try {
    const { table, data } = await request.json();

    let result;
    switch (table) {
      case 'jobPosition':
        result = await prisma.jobPosition.create({ data });
        break;
      case 'resume':
        result = await prisma.resume.create({ data });
        break;
      case 'game':
        result = await prisma.game.create({ data });
        break;
      case 'userAnswer':
        result = await prisma.userAnswer.create({ data });
        break;
      case 'surveyAnswer':
        result = await prisma.surveyAnswer.create({ data });
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid table name' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating record:', error);
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    );
  }
}

// PUT - Update record
export async function PUT(request: Request) {
  try {
    const { table, id, data } = await request.json();

    let result;
    switch (table) {
      case 'jobPosition':
        result = await prisma.jobPosition.update({
          where: { id },
          data
        });
        break;
      case 'resume':
        result = await prisma.resume.update({
          where: { id },
          data
        });
        break;
      case 'game':
        result = await prisma.game.update({
          where: { id },
          data
        });
        break;
      case 'userAnswer':
        result = await prisma.userAnswer.update({
          where: { id },
          data
        });
        break;
      case 'surveyAnswer':
        result = await prisma.surveyAnswer.update({
          where: { id },
          data
        });
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid table name' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating record:', error);
    return NextResponse.json(
      { error: 'Failed to update record' },
      { status: 500 }
    );
  }
}

// DELETE - Delete record
export async function DELETE(request: Request) {
  try {
    const { table, id } = await request.json();

    let result;
    switch (table) {
      case 'jobPosition':
        result = await prisma.jobPosition.delete({
          where: { id }
        });
        break;
      case 'resume':
        result = await prisma.resume.delete({
          where: { id }
        });
        break;
      case 'game':
        result = await prisma.game.delete({
          where: { id }
        });
        break;
      case 'userAnswer':
        result = await prisma.userAnswer.delete({
          where: { id }
        });
        break;
      case 'surveyAnswer':
        result = await prisma.surveyAnswer.delete({
          where: { id }
        });
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid table name' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 }
    );
  }
} 