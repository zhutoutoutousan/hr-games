import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateJobPosition, generateResume } from '@/lib/game-service';
import { Game, JobPosition, Resume, Prisma } from '@prisma/client';

type GameWithRelations = Game & {
  jobPosition: JobPosition;
  resumes: Resume[];
};

async function retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        // Wait for 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  throw lastError;
}

export async function POST(request: Request) {
  try {
    // Check if we have enough existing job positions
    const existingJobPositions = await prisma.jobPosition.findMany({
      include: {
        resumes: true
      }
    });

    let jobPosition: JobPosition;
    let game: GameWithRelations;

    if (existingJobPositions.length >= 3) {
      // Use a random existing job position that has enough resumes
      const validJobPositions = existingJobPositions.filter(jp => jp.resumes.length >= 3);
      if (validJobPositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * validJobPositions.length);
        jobPosition = validJobPositions[randomIndex];
        
        // Create game with existing job position
        game = await retryOperation(async () => {
          return await prisma.game.create({
            data: {
              jobPositionId: jobPosition.id
            },
            include: {
              jobPosition: true,
              resumes: true
            }
          });
        });

        // Get 3 random resumes for this job position
        const resumes = await prisma.resume.findMany({
          where: {
            jobPositionId: jobPosition.id
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 3
        });

        // Associate resumes with the new game
        await retryOperation(async () => {
          await Promise.all(resumes.map(resume => 
            prisma.resume.update({
              where: { id: resume.id },
              data: { gameId: game.id }
            })
          ));
        });
      } else {
        // If no job position has enough resumes, generate new content
        const newJobPosition = await generateJobPosition();
        jobPosition = await prisma.jobPosition.create({
          data: {
            title: newJobPosition.title,
            description: newJobPosition.description
          }
        });

        game = await retryOperation(async () => {
          return await prisma.game.create({
            data: {
              jobPositionId: jobPosition.id
            },
            include: {
              jobPosition: true,
              resumes: true
            }
          });
        });

        // Generate new resumes
        const resumes = await Promise.all([
          generateResume(jobPosition.id, true),
          generateResume(jobPosition.id, false),
          generateResume(jobPosition.id, true)
        ]);

        // Save new resumes
        await retryOperation(async () => {
          await Promise.all(resumes.map(resume => 
            prisma.resume.create({
              data: {
                content: resume.content,
                aiScore: resume.aiScore,
                isAIGenerated: resume.isAIGenerated,
                jobPositionId: jobPosition.id,
                gameId: game.id
              }
            })
          ));
        });
      }
    } else {
      // Generate new content if we don't have enough job positions
      const newJobPosition = await generateJobPosition();
      jobPosition = await prisma.jobPosition.create({
        data: {
          title: newJobPosition.title,
          description: newJobPosition.description
        }
      });

      game = await retryOperation(async () => {
        return await prisma.game.create({
          data: {
            jobPositionId: jobPosition.id
          },
          include: {
            jobPosition: true,
            resumes: true
          }
        });
      });

      // Generate new resumes
      const resumes = await Promise.all([
        generateResume(jobPosition.id, true),
        generateResume(jobPosition.id, false),
        generateResume(jobPosition.id, true)
      ]);

      // Save new resumes
      await retryOperation(async () => {
        await Promise.all(resumes.map(resume => 
          prisma.resume.create({
            data: {
              content: resume.content,
              aiScore: resume.aiScore,
              isAIGenerated: resume.isAIGenerated,
              jobPositionId: jobPosition.id,
              gameId: game.id
            }
          })
        ));
      });
    }

    // Fetch the complete game data with resumes
    const completeGame = await prisma.game.findUnique({
      where: { id: game.id },
      include: {
        jobPosition: true,
        resumes: true
      }
    });

    return NextResponse.json(completeGame);
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game. Please try again.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { gameId, resumeId, isAI, agreeScore } = await request.json();

    const answer = await retryOperation(async () => {
      return await prisma.userAnswer.create({
        data: {
          isAI,
          agreeScore,
          resumeId,
          gameId
        }
      });
    });

    return NextResponse.json(answer);
  } catch (error) {
    console.error('Error saving answer:', error);
    return NextResponse.json(
      { error: 'Failed to save answer. Please try again.' },
      { status: 500 }
    );
  }
} 