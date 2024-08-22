// import { PrismaClient } from '@prisma/client'
// import seedData from './seedData'
// const prisma = new PrismaClient()
// async function main() {
//   var res = await prisma.recommendation.createMany({
//     data: seedData.recommendations
//   })
//   console.log(res)
// }
// main()
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })