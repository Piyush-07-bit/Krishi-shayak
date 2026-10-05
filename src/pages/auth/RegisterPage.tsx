import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, ArrowLeft, Upload, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/services/supabase";

const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  city: "",
  state: "",
    profilePhoto: null as File | null,
    termsAccepted: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const panchayats = ["Palakkad", "Thrissur", "Kozhikode", "Kochi", "Alappuzha"];
  const crops = ["Paddy", "Banana", "Tomato", "Maize", "Coconut", "Pepper", "Cardamom", "Ginger"];

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate basic info
      if (!formData.fullName || !formData.phone || !formData.email || !formData.password) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match",
          variant: "destructive"
        });
        return;
      }

      // Send OTP (mock)
      setIsLoading(true);
      setTimeout(() => {
        setIsOtpSent(true);
        setIsLoading(false);
        setCurrentStep(2);
        toast({
          title: "OTP Sent",
          description: `Verification code sent to ${formData.phone}`,
        });
      }, 1000);
    } else if (currentStep === 2) {
      // Verify OTP
      if (otp !== "123456") {
        toast({
          title: "Invalid OTP",
          description: "Please enter the correct verification code",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleRegister = async () => {
    if (!formData.city || !formData.state || !formData.termsAccepted) {
      toast({
        title: "Validation Error",
        description: "Please complete all fields and accept terms",
        variant: "destructive"
      });
      return;
    }
    if (!formData.email) {
      toast({
        title: "Validation Error",
        description: "Email is required for registration.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      // Supabase sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin + "/login", // Redirect after email confirmation
          data: {
            fullName: formData.fullName,
            phone: formData.phone,
            city: formData.city,
            state: formData.state
          }
        }
      });
      if (signUpError) throw signUpError;
      const user = signUpData.user;
      if (signUpData.session === null) {
        toast({
          title: "Check your email",
          description: "A confirmation link has been sent. Please verify your email to complete registration.",
        });
        setIsLoading(false);
        return;
      }
      // Upload profile photo if provided
      let photoURL = null;
      if (formData.profilePhoto && user) {
        const fileExt = formData.profilePhoto.name.split('.').pop();
        const filePath = `profile_photos/${user.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('profile-photos').upload(filePath, formData.profilePhoto);
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('profile-photos').getPublicUrl(filePath);
          photoURL = publicUrlData?.publicUrl || null;
        }
      }
      // Insert user profile data into 'users' table
      if (user) {
        const { error: insertError } = await supabase.from('users').insert([
          {
            id: user.id,
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            city: formData.city,
            state: formData.state,
            profilePhoto: photoURL,
            createdAt: new Date().toISOString()
          }
        ]);
        if (insertError) throw insertError;
        // Fetch user profile for localStorage
        const { data: userProfile } = await supabase.from('users').select('*').eq('id', user.id).single();
        if (userProfile) {
          localStorage.setItem("digital-krishi-user", JSON.stringify(userProfile));
        }
      }
      toast({
        title: "Registration Successful",
        description: "Welcome to Krishi Sahayak!",
      });
      navigate("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error?.message || "Unable to register. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed toggleCrop and all mainCrops logic as mainCrops is no longer used

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-success/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep} of 3</span>
            <span>{Math.round((currentStep / 3) * 100)}% Complete</span>
          </div>
          <Progress value={(currentStep / 3) * 100} className="h-2" />
        </div>

        {/* Registration Card */}
        <Card className="agricultural-card">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto h-12 w-12 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
              <img src="/Krishi_Sahayak_logo_main.png" alt="Krishi Sahayak Logo" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                {currentStep === 1 && "Create Account"}
                {currentStep === 2 && "Verify Phone"}
                {currentStep === 3 && "Complete Profile"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Join the Krishi Sahayak community"}
                {currentStep === 2 && "Enter the verification code sent to your phone"}
                {currentStep === 3 && "Tell us about your farming details"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      fullName: e.target.value
                    }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 XXXXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        password: e.target.value
                      }))}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="space-y-1">
                      <Progress value={passwordStrength} className="h-1" />
                      <p className="text-xs text-muted-foreground">
                        Password strength: {passwordStrength < 50 ? "Weak" : passwordStrength < 75 ? "Medium" : "Strong"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: OTP Verification */}
            {currentStep === 2 && (
              <div className="space-y-4 text-center">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    We've sent a 6-digit verification code to
                  </p>
                  <p className="font-medium">{formData.phone}</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Demo Code: 123456</p>
                </div>

                <Button variant="ghost" size="sm">
                  Didn't receive code? Resend
                </Button>
              </div>
            )}

            {/* Step 3: Profile Completion */}
            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Enter your city"
                    value={formData.city || ""}
                    onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                      <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                      <SelectItem value="Assam">Assam</SelectItem>
                      <SelectItem value="Bihar">Bihar</SelectItem>
                      <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                      <SelectItem value="Goa">Goa</SelectItem>
                      <SelectItem value="Gujarat">Gujarat</SelectItem>
                      <SelectItem value="Haryana">Haryana</SelectItem>
                      <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                      <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                      <SelectItem value="Karnataka">Karnataka</SelectItem>
                      <SelectItem value="Kerala">Kerala</SelectItem>
                      <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                      <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="Manipur">Manipur</SelectItem>
                      <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                      <SelectItem value="Mizoram">Mizoram</SelectItem>
                      <SelectItem value="Nagaland">Nagaland</SelectItem>
                      <SelectItem value="Odisha">Odisha</SelectItem>
                      <SelectItem value="Punjab">Punjab</SelectItem>
                      <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                      <SelectItem value="Sikkim">Sikkim</SelectItem>
                      <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="Telangana">Telangana</SelectItem>
                      <SelectItem value="Tripura">Tripura</SelectItem>
                      <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                      <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                      <SelectItem value="West Bengal">West Bengal</SelectItem>
                      <SelectItem value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</SelectItem>
                      <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                      <SelectItem value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</SelectItem>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Jammu and Kashmir">Jammu and Kashmir</SelectItem>
                      <SelectItem value="Ladakh">Ladakh</SelectItem>
                      <SelectItem value="Lakshadweep">Lakshadweep</SelectItem>
                      <SelectItem value="Puducherry">Puducherry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profilePhoto">Profile Photo (Optional)</Label>
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer"
                    onClick={() => document.getElementById('profilePhotoInput')?.click()}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        setFormData(prev => ({ ...prev, profilePhoto: file }));
                      }
                    }}
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    {formData.profilePhoto && (
                      <p className="text-xs text-success mt-2">Selected: {formData.profilePhoto.name}</p>
                    )}
                    <input
                      id="profilePhotoInput"
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          setFormData(prev => ({ ...prev, profilePhoto: file }));
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      termsAccepted: checked as boolean
                    }))}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I accept the{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                className="w-full gradient-primary text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Continue"}
              </Button>
            ) : (
              <Button
                onClick={handleRegister}
                className="w-full gradient-primary text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            )}

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;