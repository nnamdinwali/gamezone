import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateGame } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Upload as UploadIcon, Rocket, Link2, Image as ImageIcon } from "lucide-react";

const GENRES = ["Action", "Adventure", "Puzzle", "Arcade", "Strategy", "RPG", "Shooter", "Sports"];

const uploadSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(50),
  description: z.string().min(10, "Description needs more detail").max(500),
  genre: z.string().min(1, "Please select a genre"),
  thumbnailUrl: z.string().url("Must be a valid image URL").or(z.literal("")),
  gameUrl: z.string().url("Must be a valid URL for the game or landing page"),
  androidStoreUrl: z.string().url("Must be a valid Google Play URL").or(z.literal("")),
  iosStoreUrl: z.string().url("Must be a valid App Store URL").or(z.literal("")),
  packageName: z.string().max(200).or(z.literal("")),
  creatorName: z.string().min(2, "Creator name required"),
  rewardPerMinute: z.coerce.number().min(1).max(100),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export function UploadPage() {
  const [, setLocation] = useLocation();
  const createGame = useCreateGame();

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      genre: "",
      thumbnailUrl: "",
      gameUrl: "",
      androidStoreUrl: "",
      iosStoreUrl: "",
      packageName: "",
      creatorName: "",
      rewardPerMinute: 10,
    },
  });

  const onSubmit = (data: UploadFormValues) => {
    createGame.mutate(
      { data },
      {
        onSuccess: (game) => {
          toast({
            title: "Game Deployed!",
            description: `${game.title} is now live on Rockcity Games.`,
            variant: "success",
          });
          setLocation(`/games/${game.id}`);
        },
        onError: () => {
          toast({
            title: "Deployment Failed",
            description: "There was an error uploading your game.",
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold font-heading uppercase tracking-tighter text-glow-primary">Deploy Game</h1>
        <p className="text-muted-foreground">Add your game to the platform and let players earn while they play.</p>
      </div>

      <Card className="border-primary/20 shadow-[0_0_50px_-20px_hsl(var(--primary))] bg-card/80 backdrop-blur">
        <CardHeader className="border-b border-border/50 bg-muted/20 pb-8">
          <CardTitle className="text-2xl flex items-center gap-3">
            <Rocket className="w-6 h-6 text-primary" /> Game Details
          </CardTitle>
          <CardDescription>Fill out the metadata for your game embed.</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Neon Rider 2049" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select genre" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GENRES.map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="creatorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Studio / Creator Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Pixelated Dreams" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A fast-paced synthwave racing game..." 
                        className="resize-none h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-6 p-6 rounded-xl border border-dashed border-border bg-background/50">
                <h3 className="font-heading font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-accent" /> Links & Assets
                </h3>
                
                <FormField
                  control={form.control}
                  name="gameUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game / Landing URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/embed/game" type="url" {...field} />
                      </FormControl>
                      <FormDescription>Legacy game or landing URL. Add the store links below for APK offers.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="androidStoreUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Play Store URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://play.google.com/store/apps/details?id=..." type="url" {...field} />
                      </FormControl>
                      <FormDescription>Shown to Android users when they tap Play and Earn.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iosStoreUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apple App Store URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://apps.apple.com/app/..." type="url" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="packageName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Android Package Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="com.example.game" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thumbnailUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail Image URL (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input placeholder="https://example.com/thumb.jpg" type="url" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="rewardPerMinute"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reward Rate (pts/min)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>How many points players earn per minute played.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={createGame.isPending}
              >
                {createGame.isPending ? (
                  "DEPLOYING..."
                ) : (
                  <>DEPLOY GAME <UploadIcon className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
