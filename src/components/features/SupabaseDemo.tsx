import { useState } from "react";
import { useSupabaseQuery, useSupabaseMutation, useAuth } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn, signUp } from "@/lib/supabase";

/**
 * Example Component: Supabase Integration Demo
 * Shows how to use authentication, queries, and mutations
 */

export default function SupabaseDemo() {
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Query molecules from database
  const { data: molecules, loading, error } = useSupabaseQuery("molecules");

  // Mutation hook for molecules table
  const { insert, update, delete: deleteMolecule, loading: mutating, error: mutateError } = useSupabaseMutation("molecules");

  // Handle Sign Up
  const handleSignUp = async () => {
    try {
      setAuthError("");
      await signUp(email, password);
      alert("Sign up successful! Check your email.");
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  // Handle Sign In
  const handleSignIn = async () => {
    try {
      setAuthError("");
      await signIn(email, password);
      alert("Signed in successfully!");
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  // Handle Add Molecule
  const handleAddMolecule = async () => {
    try {
      const result = await insert({
        name: "Water",
        formula: "H₂O",
        atomic_number: 8,
        description: "Essential compound for life",
        created_at: new Date(),
      });
      if (result) alert("Molecule added!");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Handle Delete Molecule
  const handleDeleteMolecule = async (id: string) => {
    try {
      await deleteMolecule(id);
      alert("Molecule deleted!");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (authLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Supabase Integration Demo</h1>

      {/* Auth Section */}
      {!user ? (
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleSignIn}>Sign In</Button>
              <Button variant="outline" onClick={handleSignUp}>
                Sign Up
              </Button>
            </div>
            {authError && <p className="text-red-500">{authError}</p>}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user.email}!</CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Molecules Section */}
      <Card>
        <CardHeader>
          <CardTitle>Molecules Database</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleAddMolecule} disabled={mutating}>
            {mutating ? "Adding..." : "Add New Molecule"}
          </Button>

          {loading && <p>Loading molecules...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {mutateError && <p className="text-red-500">Error: {mutateError}</p>}

          {molecules && molecules.length > 0 ? (
            <div className="space-y-2">
              {molecules.map((molecule: any) => (
                <div
                  key={molecule.id}
                  className="flex justify-between items-center p-3 border rounded"
                >
                  <div>
                    <p className="font-semibold">{molecule.name}</p>
                    <p className="text-sm text-gray-500">{molecule.formula}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteMolecule(molecule.id)}
                    disabled={mutating}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p>No molecules found. Add one to get started!</p>
          )}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Create tables in Supabase dashboard</li>
            <li>Update `.env.local` with your Supabase URL and Anon Key</li>
            <li>Enable Row Level Security (RLS) on your tables</li>
            <li>Set appropriate policies in Supabase</li>
            <li>Restart your dev server</li>
          </ol>
          <p className="mt-4 text-sm text-gray-600">
            See <code>SUPABASE_SETUP.md</code> for detailed instructions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
