import { setLoading, setToken, } from "@/slices/authSlice";
import { setUser } from "@/slices/profileSlice";
import { toast } from 'sonner'
import { endpoints } from "../apis"
import { caseEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";

const { SENDOTP_API, SIGNUP_API, GOOGLE_AUTH_API, LOGIN_API } = endpoints;
const {
  IS_CASE_CREATED,
  CREATE_CASE_API,
  ACCEPT_CASE_API,
} = caseEndpoints;


export function googleAuth(credential, accountType = 'Client', navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    try {
      console.log("Making request to:", GOOGLE_AUTH_API);
      console.log("With data:", { credential, accountType });

      const response = await apiConnector(
        "POST",
        GOOGLE_AUTH_API,
        {
          credential,
          accountType
        },
        {
          'Content-Type': 'application/json',
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Login Successful");
      dispatch(setToken(response.data.token));
      
      const userImage = response.data?.user?.image
        ? response.data.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`;
      
      dispatch(setUser({ ...response.data.user, image: userImage }));
      
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (response.data.user.accountType === 'Provider') {
        navigate('/form');
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      console.log("GOOGLE AUTH ERROR............", error);
      toast.error("Google auth failed");
    } finally {
      toast.dismiss(toastId);
    }
  };
}


export function sendOtp(email, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", SENDOTP_API, {
        email,
        checkUserPresent: true,
      });
      console.log("SENDOTP API RESPONSE............", response);

      console.log(response.data.success);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("OTP Sent Successfully");
      navigate("/verify-email");
    } catch (error) {
      console.log("SENDOTP API ERROR............", error);
      toast.error("Could Not Send OTP");
      console.log("Error from otp sendinggg: ", error);
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

export function login(email, password, navigate) {
    return async (dispatch) => {
      const toastId = toast.loading("Loading..."); // Show loading toast
      dispatch(setLoading(true));
  
      try {
        const response = await apiConnector("POST", LOGIN_API, {
          email,
          password,
        });
  
        console.log("LOGIN API RESPONSE............", response);
  
        if (!response.data.success) {
          throw new Error(response.data.message);
        }
  
        // Dismiss loading toast and show success
        toast.dismiss(toastId);
        toast.success("Login Successful");
  
        dispatch(setToken(response.data.token));
  
        const userImage = response.data?.user?.image
          ? response.data.user.image
          : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`;
  
        dispatch(setUser({ ...response.data.user, image: userImage }));
  
        // Store token and user in local storage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
  
        // Navigate to the user's profile
        //if case already created then navigate to dashboard else navigate to create case
        const cases = await apiConnector("GET", IS_CASE_CREATED, null, null, { email});    
    
        if(cases.data.data.length > 0) {
          navigate("/dashboard")
        }
        else {
          navigate('/create-case')
        }

      } catch (error) {
        console.log(LOGIN_API);
        console.log("LOGIN API ERROR............", error);
  
        // Dismiss loading toast and show error
        toast.dismiss(toastId);
        toast.error(error?.response?.data?.message || "Login failed!"); // Handle undefined error messages
      } 
      
      dispatch(setLoading(false)); // Ensure loading state is set to false
      
    };
}

export function logout(navigate) {
  return (dispatch) => {
    dispatch(setToken(null))
    dispatch(setUser(null))

    localStorage.removeItem("token")
    localStorage.removeItem("user")

    toast.success("Logged Out")
    navigate("/")
  }
}

export function signup(
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  accountType,
  otp,
  navigate
) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    try {
      const response = await apiConnector("POST", SIGNUP_API, {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        otp,
      });

      console.log("SIGNUP API RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Signup Successful");
      
      // Set token and user data
      dispatch(setToken(response.data.token));
      dispatch(setUser(response.data.user));
      
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Navigate based on account type
      if (accountType === "Provider") {
        navigate("/form");
      } else {
        navigate("/dashboard");
      }
      
    } catch (error) {
      console.log("SIGNUP API ERROR............", error);
      toast.error("Signup Failed");
      navigate("/signup");
    } finally {
      toast.dismiss(toastId);
    }
  };
}