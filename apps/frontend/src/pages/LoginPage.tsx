import { useNavigate, useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import FormHelperText from '@mui/material/FormHelperText';
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
import {
  Box,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Typography,
  Button,
  Divider
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContextProvider';

const GoogleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    style={{ marginRight: '8px' }}
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const formSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email')
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(3, 'Password must have min 3 characters')
});

type formType = z.infer<typeof formSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken } = useAuth();

  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const access = searchParams.get('access_token');
    const refresh = searchParams.get('refresh_token');
    if (access && refresh) {
      setToken(access, refresh);
      navigate('/dashboard');
    }
  }, [searchParams, setToken, navigate]);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<formType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setError(false);
      setErrorText('');
      setSubmitting(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_LOGIN}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            password: data.password
          })
        }
      );

      if (response.ok) {
        const body = await response.json();
        setToken(body.access_token, body.refresh_token);
        navigate('/dashboard');
      } else {
        setSubmitting(false);
        const body = await response.json();
        if (body.error) {
          setError(true);
          setErrorText(body.error);
        } else {
          setError(true);
          setErrorText('An unexpected error occurred');
        }
      }
    } catch (error) {
      setError(true);
      setErrorText('An unexpected error is occured');
      setSubmitting(false);
    }
  };

  const handleClickShowPassword = () =>
    setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_GOOGLE_LOGIN}`;
  };

  return (
    <Container maxWidth="xs" sx={{ marginTop: '1rem' }}>
      <Box sx={{ width: '30ch', marginX: 'auto' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            marginBottom: '1rem'
          }}
        >
          Login
        </Typography>
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction={'column'} spacing={1} alignItems={'center'}>
          <FormControl
            sx={{ m: 1, width: '30ch' }}
            variant="outlined"
          >
            <InputLabel htmlFor="outlined-adornment-email">
              Email
            </InputLabel>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <OutlinedInput
                  label="Email"
                  id="outlined-adornment-email"
                  type="email"
                  {...field}
                />
              )}
            />
            <FormHelperText
              id="email-error-text"
              error={errors.email?.message !== '' ? true : false}
            >
              {errors.email?.message}
            </FormHelperText>
          </FormControl>

          <FormControl
            sx={{ m: 1, width: '30ch' }}
            variant="outlined"
          >
            <InputLabel htmlFor="outlined-adornment-password">
              Password
            </InputLabel>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <OutlinedInput
                  label="Password"
                  id="outlined-adornment-password"
                  type={showPassword ? 'text' : 'password'}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {showPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                  {...field}
                />
              )}
            />
            <FormHelperText
              id="password-error-text"
              error={errors.password?.message !== '' ? true : false}
            >
              {errors.password?.message}
            </FormHelperText>
          </FormControl>

          <Box sx={{ textAlign: 'center' }}>
            <LoadingButton
              type="submit"
              size="small"
              endIcon={<SendIcon />}
              loading={submitting}
              loadingPosition="end"
              variant="contained"
              sx={{ width: '8rem' }}
            >
              <span>Login</span>
            </LoadingButton>
          </Box>
          {error && (
            <FormHelperText error={error}>{errorText}</FormHelperText>
          )}

          <Divider sx={{ width: '30ch', my: 2 }}>ou</Divider>

          <Box sx={{ textAlign: 'center', width: '30ch' }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{
                textTransform: 'none',
                borderColor: '#ccc',
                color: 'text.primary',
                '&:hover': {
                  borderColor: '#bbb',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Google
            </Button>
          </Box>
        </Stack>
      </form>
    </Container>
  );
};

export default LoginPage;
