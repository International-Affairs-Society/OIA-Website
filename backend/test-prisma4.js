import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  try {
    const res = await prisma.events.update({
      where: { id: "4b000cb6-fc12-4a40-96a2-f8abc2dba269" },
      data: { date: null }
    })
    console.log("Success")
  } catch (e) {
    console.log("Error:\n" + e.message)
  } finally {
    await prisma.$disconnect()
  }
}
main()
