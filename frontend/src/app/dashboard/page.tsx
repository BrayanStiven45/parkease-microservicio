'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard - ParkEase
          </h1>
          <Button onClick={handleLogout} variant="outline">
            Cerrar Sesión
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Bienvenido</CardTitle>
              <CardDescription>
                {user?.email ? `Conectado como: ${user.email}` : 'Usuario conectado'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Sistema de gestión de parqueaderos en funcionamiento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gestión de Vehículos</CardTitle>
              <CardDescription>
                Registrar entrada y salida de vehículos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Ver Vehículos Activos
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial</CardTitle>
              <CardDescription>
                Consultar historial de parqueo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Ver Historial
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sugeridor de Tarifas</CardTitle>
              <CardDescription>
                Sistema de IA para optimización de tarifas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Obtener Sugerencias
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Administración</CardTitle>
              <CardDescription>
                Gestión de sucursales y configuración
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Panel de Admin
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>
                Métricas y reportes del negocio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Ver Reportes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}