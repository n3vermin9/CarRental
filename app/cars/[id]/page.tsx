import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CarShareApp from '../../carshare-app';
import { cars } from '../../carshare-domain';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const car = cars.find((item) => item.id === Number(id));
  if (!car) return { title: 'Car not found · CarShare', description: 'Browse available CarShare vehicles.' };
  return {
    title: `${car.name} · CarShare`,
    description: `Reserve the ${car.name} in Central Grozny from ₽${car.price.toLocaleString('ru-RU')} per day.`,
    openGraph: { title: `${car.name} · CarShare`, description: `Available in Central Grozny from ₽${car.price.toLocaleString('ru-RU')} per day.`, images: [] },
    twitter: { title: `${car.name} · CarShare`, description: `Available in Central Grozny from ₽${car.price.toLocaleString('ru-RU')} per day.`, images: [] },
  };
}

export default async function CarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const carId = Number(id);
  if (!cars.some((car) => car.id === carId)) notFound();
  return <CarShareApp initialTab="explore" initialCarId={carId} />;
}
