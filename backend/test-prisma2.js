import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  try {
    const res = await prisma.events.update({
      where: { id: "4b000cb6-fc12-4a40-96a2-f8abc2dba269" },
      data: {
        title: "Test",
        event_type: "upcoming",
        description: null,
        location: null,
        date: new Date(),
        end_date: null,
        highlights: [],
        poster_ratio: null,
        linked_mou_id: null,
        is_archived: false,
        add_to_homepage: false,
        registration_link: null,
        poster_url: null,
        gallery_urls: [],
        status: "published",
        updated_at: new Date()
      }
    })
    console.log("Success")
  } catch (e) {
    console.log("Error:\n" + e.message)
  } finally {
    await prisma.$disconnect()
  }
}
main()
