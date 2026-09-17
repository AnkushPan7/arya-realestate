import { getSiteSettings } from "@/lib/public-data";

export const revalidate = 3600;

export type GoogleReview = {
  authorName: string;
  authorUrl: string | null;
  profilePhotoUrl: string | null;
  rating: number;
  relativeTimeDescription: string;
  text: string;
  time: number;
};

type GooglePlacesReview = {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
};

type GooglePlacesDetailsResponse = {
  status: string;
  result?: {
    reviews?: GooglePlacesReview[];
  };
};

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const settings = await getSiteSettings();
    const placeId = settings?.googleReviewsPlaceId;

    if (!apiKey || !placeId) {
      return Response.json({ data: [] });
    }

    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.set("place_id", placeId);
    url.searchParams.set("fields", "reviews,rating,user_ratings_total");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      return Response.json({ data: [] });
    }

    const json = (await res.json()) as GooglePlacesDetailsResponse;

    if (json.status !== "OK" || !json.result?.reviews) {
      return Response.json({ data: [] });
    }

    const reviews: GoogleReview[] = json.result.reviews.map((review) => ({
      authorName: review.author_name,
      authorUrl: review.author_url ?? null,
      profilePhotoUrl: review.profile_photo_url ?? null,
      rating: review.rating,
      relativeTimeDescription: review.relative_time_description,
      text: review.text,
      time: review.time,
    }));

    return Response.json({ data: reviews });
  } catch {
    return Response.json({ data: [] });
  }
}
