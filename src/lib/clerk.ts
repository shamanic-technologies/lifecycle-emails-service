import { createClerkClient } from "@clerk/backend";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

/**
 * Resolve a single user's primary email from their Clerk user ID.
 */
export async function resolveUserEmail(clerkUserId: string): Promise<string> {
  const user = await clerk.users.getUser(clerkUserId);
  const primary = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  );
  const email = primary?.emailAddress || user.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error(`No email found for Clerk user ${clerkUserId}`);
  }
  return email;
}

/**
 * Resolve all org members' emails from a Clerk org ID.
 */
export async function resolveOrgEmails(clerkOrgId: string): Promise<string[]> {
  const memberships = await clerk.organizations.getOrganizationMembershipList({
    organizationId: clerkOrgId,
  });

  const emails: string[] = [];
  for (const membership of memberships.data) {
    const email = membership.publicUserData?.identifier;
    if (email) {
      emails.push(email);
    }
  }

  if (emails.length === 0) {
    throw new Error(`No member emails found for Clerk org ${clerkOrgId}`);
  }
  return emails;
}
