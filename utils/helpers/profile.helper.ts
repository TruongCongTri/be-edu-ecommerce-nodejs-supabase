// src/utils/profileHelpers.ts
import { Repository, FindOptionsWhere, FindOneOptions } from 'typeorm';
import { AppError } from "../errors/AppError"; // Adjust path if needed
import { User } from '../../src/database/entities/User'; // Assuming User entity is here

// Define a generic type for profiles that have a 'user' relation with 'id'
interface ProfileEntityWithUserRelation  {
  id: string; // The profile's own ID
  user: User; // The related User entity with its ID
}

/**
 * Fetches a user's associated profile (JobSeeker or Employer) by their userId.
 * Throws an AppError if the profile is not found.
 * @param repo The TypeORM Repository for the profile entity (e.g., JobSeeker, Employer).
 * @param userId The ID of the authenticated user.
 * @param profileName A string for the error message (e.g., "Job seeker", "Employer").
 * @returns The found profile entity.
 */
export async function getProfileByUserId<T extends ProfileEntityWithUserRelation >(
  repo: Repository<T>,
  userId: string,
  profileName: string
): Promise<T> {
  const findOptions: FindOneOptions<T> = {
    where: {
      user: { id: userId } as FindOptionsWhere<User>, // Cast the nested 'user' part to FindOptionsWhere<User>
    } as FindOptionsWhere<T>, // Cast the entire 'where' object to FindOptionsWhere<T>
  };

  const profile = await repo.findOne(findOptions);
  
  if (!profile) {
    throw new AppError(`${profileName} profile not found`, 404);
  }
  return profile;
}