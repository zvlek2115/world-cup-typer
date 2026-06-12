import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed: ensuring data stability...');

  // Ensure admin user exists
  const adminUsername = 'zylek';
  const adminPassword = 'zylek';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername }
  });

  if (!existingAdmin) {
    console.log(`Creating admin user: ${adminUsername}`);
    await prisma.user.create({
      data: {
        username: adminUsername,
        passwordHash: hashedPassword,
        role: Role.ADMIN
      }
    });
  } else {
    console.log(`Updating existing user ${adminUsername} to ADMIN role`);
    await prisma.user.update({
      where: { username: adminUsername },
      data: { 
        role: Role.ADMIN 
      }
    });
  }

  const teams = [
    { name: "Meksyk", groupName: "A" }, { name: "RPA", groupName: "A" }, { name: "Korea Południowa", groupName: "A" }, { name: "Czechy", groupName: "A" },
    { name: "Kanada", groupName: "B" }, { name: "Bośnia i Hercegowina", groupName: "B" }, { name: "Katar", groupName: "B" }, { name: "Szwajcaria", groupName: "B" },
    { name: "Brazylia", groupName: "C" }, { name: "Maroko", groupName: "C" }, { name: "Haiti", groupName: "C" }, { name: "Szkocja", groupName: "C" },
    { name: "USA", groupName: "D" }, { name: "Paragwaj", groupName: "D" }, { name: "Australia", groupName: "D" }, { name: "Turcja", groupName: "D" },
    { name: "Niemcy", groupName: "E" }, { name: "Curacao", groupName: "E" }, { name: "Wybrzeże Kości Słoniowej", groupName: "E" }, { name: "Ekwador", groupName: "E" },
    { name: "Holandia", groupName: "F" }, { name: "Japonia", groupName: "F" }, { name: "Szwecja", groupName: "F" }, { name: "Tunezja", groupName: "F" },
    { name: "Belgia", groupName: "G" }, { name: "Egipt", groupName: "G" }, { name: "Iran", groupName: "G" }, { name: "Nowa Zelandia", groupName: "G" },
    { name: "Hiszpania", groupName: "H" }, { name: "Republika Zielonego Przylądka", groupName: "H" }, { name: "Arabia Saudyjska", groupName: "H" }, { name: "Urugwaj", groupName: "H" },
    { name: "Francja", groupName: "I" }, { name: "Senegal", groupName: "I" }, { name: "Irak", groupName: "I" }, { name: "Norwegia", groupName: "I" },
    { name: "Argentyna", groupName: "J" }, { name: "Algieria", groupName: "J" }, { name: "Austria", groupName: "J" }, { name: "Jordania", groupName: "J" },
    { name: "Portugalia", groupName: "K" }, { name: "DR Konga", groupName: "K" }, { name: "Uzbekistan", groupName: "K" }, { name: "Kolumbia", groupName: "K" },
    { name: "Anglia", groupName: "L" }, { name: "Chorwacja", groupName: "L" }, { name: "Ghana", groupName: "L" }, { name: "Panama", groupName: "L" }
  ];

  for (const team of teams) {
    await (prisma as any).team.upsert({
      where: { name: team.name },
      update: { groupName: team.groupName },
      create: team
    });
  }
  console.log(`Seed: Synchronized ${teams.length} teams`);

  const matches = [
    { "homeTeam": "Meksyk", "awayTeam": "RPA", "startTime": new Date("2026-06-11T19:00:00Z"), "homeScore": 2, "awayScore": 0, "status": "FINISHED" },
    { "homeTeam": "Korea Południowa", "awayTeam": "Czechy", "startTime": new Date("2026-06-12T02:00:00Z"), "homeScore": 2, "awayScore": 1, "status": "FINISHED" },
    { "homeTeam": "Kanada", "awayTeam": "Bośnia i Hercegowina", "startTime": new Date("2026-06-12T19:00:00Z") },
    { "homeTeam": "USA", "awayTeam": "Paragwaj", "startTime": new Date("2026-06-13T01:00:00Z") },
    { "homeTeam": "Katar", "awayTeam": "Szwajcaria", "startTime": new Date("2026-06-13T19:00:00Z") },
    { "homeTeam": "Brazylia", "awayTeam": "Maroko", "startTime": new Date("2026-06-13T22:00:00Z") },
    { "homeTeam": "Haiti", "awayTeam": "Szkocja", "startTime": new Date("2026-06-14T01:00:00Z") },
    { "homeTeam": "Australia", "awayTeam": "Turcja", "startTime": new Date("2026-06-14T04:00:00Z") },
    { "homeTeam": "Niemcy", "awayTeam": "Curacao", "startTime": new Date("2026-06-14T17:00:00Z") },
    { "homeTeam": "Holandia", "awayTeam": "Japonia", "startTime": new Date("2026-06-14T20:00:00Z") },
    { "homeTeam": "Wybrzeże Kości Słoniowej", "awayTeam": "Ekwador", "startTime": new Date("2026-06-14T23:00:00Z") },
    { "homeTeam": "Szwecja", "awayTeam": "Tunezja", "startTime": new Date("2026-06-15T02:00:00Z") },
    { "homeTeam": "Hiszpania", "awayTeam": "Republika Zielonego Przylądka", "startTime": new Date("2026-06-15T16:00:00Z") },
    { "homeTeam": "Belgia", "awayTeam": "Egipt", "startTime": new Date("2026-06-15T19:00:00Z") },
    { "homeTeam": "Arabia Saudyjska", "awayTeam": "Urugwaj", "startTime": new Date("2026-06-15T22:00:00Z") },
    { "homeTeam": "Iran", "awayTeam": "Nowa Zelandia", "startTime": new Date("2026-06-16T01:00:00Z") },
    { "homeTeam": "Francja", "awayTeam": "Senegal", "startTime": new Date("2026-06-16T19:00:00Z") },
    { "homeTeam": "Irak", "awayTeam": "Norwegia", "startTime": new Date("2026-06-16T22:00:00Z") },
    { "homeTeam": "Argentyna", "awayTeam": "Algieria", "startTime": new Date("2026-06-17T01:00:00Z") },
    { "homeTeam": "Austria", "awayTeam": "Jordania", "startTime": new Date("2026-06-17T04:00:00Z") },
    { "homeTeam": "Portugalia", "awayTeam": "DR Konga", "startTime": new Date("2026-06-17T17:00:00Z") },
    { "homeTeam": "Anglia", "awayTeam": "Chorwacja", "startTime": new Date("2026-06-17T20:00:00Z") },
    { "homeTeam": "Ghana", "awayTeam": "Panama", "startTime": new Date("2026-06-17T23:00:00Z") },
    { "homeTeam": "Uzbekistan", "awayTeam": "Kolumbia", "startTime": new Date("2026-06-18T02:00:00Z") },
    { "homeTeam": "Czechy", "awayTeam": "RPA", "startTime": new Date("2026-06-18T16:00:00Z") },
    { "homeTeam": "Szwajcaria", "awayTeam": "Bośnia i Hercegowina", "startTime": new Date("2026-06-18T19:00:00Z") },
    { "homeTeam": "Kanada", "awayTeam": "Katar", "startTime": new Date("2026-06-18T22:00:00Z") },
    { "homeTeam": "Meksyk", "awayTeam": "Korea Południowa", "startTime": new Date("2026-06-19T01:00:00Z") },
    { "homeTeam": "USA", "awayTeam": "Australia", "startTime": new Date("2026-06-19T19:00:00Z") },
    { "homeTeam": "Szkocja", "awayTeam": "Maroko", "startTime": new Date("2026-06-19T22:00:00Z") },
    { "homeTeam": "Brazylia", "awayTeam": "Haiti", "startTime": new Date("2026-06-20T01:00:00Z") },
    { "homeTeam": "Turcja", "awayTeam": "Paragwaj", "startTime": new Date("2026-06-20T03:00:00Z") },
    { "homeTeam": "Holandia", "awayTeam": "Szwecja", "startTime": new Date("2026-06-20T17:00:00Z") },
    { "homeTeam": "Niemcy", "awayTeam": "Wybrzeże Kości Słoniowej", "startTime": new Date("2026-06-20T20:00:00Z") },
    { "homeTeam": "Ekwador", "awayTeam": "Curacao", "startTime": new Date("2026-06-21T00:00:00Z") },
    { "homeTeam": "Tunezja", "awayTeam": "Japonia", "startTime": new Date("2026-06-21T04:00:00Z") },
    { "homeTeam": "Hiszpania", "awayTeam": "Arabia Saudyjska", "startTime": new Date("2026-06-21T16:00:00Z") },
    { "homeTeam": "Belgia", "awayTeam": "Iran", "startTime": new Date("2026-06-21T19:00:00Z") },
    { "homeTeam": "Urugwaj", "awayTeam": "Republika Zielonego Przylądka", "startTime": new Date("2026-06-21T22:00:00Z") },
    { "homeTeam": "Nowa Zelandia", "awayTeam": "Egipt", "startTime": new Date("2026-06-22T01:00:00Z") },
    { "homeTeam": "Argentyna", "awayTeam": "Austria", "startTime": new Date("2026-06-22T17:00:00Z") },
    { "homeTeam": "Francja", "awayTeam": "Irak", "startTime": new Date("2026-06-22T21:00:00Z") },
    { "homeTeam": "Norwegia", "awayTeam": "Senegal", "startTime": new Date("2026-06-23T00:00:00Z") },
    { "homeTeam": "Jordania", "awayTeam": "Algieria", "startTime": new Date("2026-06-23T03:00:00Z") },
    { "homeTeam": "Portugalia", "awayTeam": "Uzbekistan", "startTime": new Date("2026-06-23T17:00:00Z") },
    { "homeTeam": "Anglia", "awayTeam": "Ghana", "startTime": new Date("2026-06-23T20:00:00Z") },
    { "homeTeam": "Panama", "awayTeam": "Chorwacja", "startTime": new Date("2026-06-23T23:00:00Z") },
    { "homeTeam": "Kolumbia", "awayTeam": "DR Konga", "startTime": new Date("2026-06-24T02:00:00Z") },
    { "homeTeam": "Szwajcaria", "awayTeam": "Kanada", "startTime": new Date("2026-06-24T19:00:00Z") },
    { "homeTeam": "Bośnia i Hercegowina", "awayTeam": "Katar", "startTime": new Date("2026-06-24T19:00:00Z") }
  ];

  for (const matchData of matches) {
    const existingMatch = await prisma.match.findFirst({
      where: {
        homeTeam: matchData.homeTeam,
        awayTeam: matchData.awayTeam,
        startTime: matchData.startTime
      }
    });

    if (existingMatch) {
      await prisma.match.update({
        where: { id: existingMatch.id },
        data: {
          homeScore: matchData.homeScore,
          awayScore: matchData.awayScore,
          status: (matchData as any).status || 'SCHEDULED'
        }
      });
    } else {
      await prisma.match.create({
        data: matchData as any
      });
    }
  }

  console.log(`Seed: Matches synchronized. Results updated.`);

  // User Predictions Data
  const userPredictions = [
    {
      username: "Twojamamaunasjest",
      predictions: [
        { homeTeam: "Meksyk", awayTeam: "RPA", homeScore: 2, awayScore: 1 },
        { homeTeam: "Korea Południowa", awayTeam: "Czechy", homeScore: 1, awayScore: 1 }
      ]
    },
    {
      username: "gregor_samsa",
      predictions: [
        { homeTeam: "Meksyk", awayTeam: "RPA", homeScore: 3, awayScore: 1 },
        { homeTeam: "Korea Południowa", awayTeam: "Czechy", homeScore: 0, awayScore: 1 }
      ]
    },
    {
      username: "Mateusz",
      predictions: [
        { homeTeam: "Meksyk", awayTeam: "RPA", homeScore: 2, awayScore: 0 },
        { homeTeam: "Korea Południowa", awayTeam: "Czechy", homeScore: 1, awayScore: 2 }
      ]
    },
    {
      username: "zylek",
      predictions: [
        { homeTeam: "Meksyk", awayTeam: "RPA", homeScore: 2, awayScore: 0 },
        { homeTeam: "Korea Południowa", awayTeam: "Czechy", homeScore: 1, awayScore: 1 }
      ]
    },
    {
      username: "Xynia",
      predictions: [
        { homeTeam: "Meksyk", awayTeam: "RPA", homeScore: 1, awayScore: 1 },
        { homeTeam: "Korea Południowa", awayTeam: "Czechy", homeScore: 1, awayScore: 3 }
      ]
    }
  ];

  const defaultPassword = await bcrypt.hash('password123', 10);

  for (const userData of userPredictions) {
    const user = await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: {
        username: userData.username,
        passwordHash: defaultPassword,
        role: Role.USER
      }
    });

    for (const pred of userData.predictions) {
      const match = await prisma.match.findFirst({
        where: { homeTeam: pred.homeTeam, awayTeam: pred.awayTeam }
      });

      if (match) {
        let points = 0;
        if (match.status === 'FINISHED' && match.homeScore !== null && match.awayScore !== null) {
          if (pred.homeScore === match.homeScore && pred.awayScore === match.awayScore) {
            points = 3;
          } else {
            const actualDiff = match.homeScore - match.awayScore;
            const predDiff = pred.homeScore - pred.awayScore;
            if ((actualDiff > 0 && predDiff > 0) || (actualDiff < 0 && predDiff < 0) || (actualDiff === 0 && predDiff === 0)) {
              points = 1;
            }
          }
        }

        await prisma.prediction.upsert({
          where: {
            userId_matchId: {
              userId: user.id,
              matchId: match.id
            }
          },
          update: {
            predictedHomeScore: pred.homeScore,
            predictedAwayScore: pred.awayScore,
            pointsEarned: points
          },
          create: {
            userId: user.id,
            matchId: match.id,
            predictedHomeScore: pred.homeScore,
            predictedAwayScore: pred.awayScore,
            pointsEarned: points
          }
        });
      }
    }
  }

  console.log(`Seed: User predictions and points updated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
