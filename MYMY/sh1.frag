#version 330
uniform vec2 resol;
uniform vec3 dir;
uniform vec3 pos;
uniform vec2 u_seed1;
uniform vec2 u_seed2;
out vec4 fragColor;
uvec4 R_STATE;

vec3 sph = vec3(3,0,0);
vec3 plane = vec3(0,0,0);
vec3 box = vec3(0,0,0);
vec3 light = normalize(vec3(1,-0.5,1));

uint TausStep(uint z, int S1, int S2, int S3, uint M)
{
	uint b = (((z << S1) ^ z) >> S2);
	return (((z & M) << S3) ^ b);	
}

uint LCGStep(uint z, uint A, uint C)
{
	return (A * z + C);	
}

vec2 hash22(vec2 p)
{
	p += u_seed1.x;
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
	p3 += dot(p3, p3.yzx+33.33);
	return fract((p3.xx+p3.yz)*p3.zy);
}

float random()
{
	R_STATE.x = TausStep(R_STATE.x, 13, 19, 12, uint(4294967294));
	R_STATE.y = TausStep(R_STATE.y, 2, 25, 4, uint(4294967288));
	R_STATE.z = TausStep(R_STATE.z, 3, 11, 17, uint(4294967280));
	R_STATE.w = LCGStep(R_STATE.w, uint(1664525), uint(1013904223));
	return 2.3283064365387e-10 * float((R_STATE.x ^ R_STATE.y ^ R_STATE.z ^ R_STATE.w));
}

vec3 randomOnSphere() {
	vec3 rand = vec3(random(), random(), random());
	float theta = rand.x * 2.0 * 3.14159265;
	float v = rand.y;
	float phi = acos(2.0 * v - 1.0);
	float r = pow(rand.z, 1.0 / 3.0);
	float x = r * sin(phi) * cos(theta);
	float y = r * sin(phi) * sin(theta);
	float z = r * cos(phi);
	return vec3(x, y, z);
}


vec2 boxIntersection( in vec3 ro, in vec3 rd, vec3 boxSize, out vec3 outNormal ) 
{
    vec3 m = 1.0/rd; // can precompute if traversing a set of aligned boxes
    vec3 n = m*ro;   // can precompute if traversing a set of aligned boxes
    vec3 k = abs(m)*boxSize;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max( max( t1.x, t1.y ), t1.z );
    float tF = min( min( t2.x, t2.y ), t2.z );
    if( tN>tF || tF<0.0) return vec2(-1.0); // no intersection
    outNormal = -sign(rd)*step(t1.yzx,t1.xyz)*step(t1.zxy,t1.xyz);
    return vec2( tN, tF );
}
vec2 sphIntersect( in vec3 ro, in vec3 rd, in vec3 ce, float ra )
{
    vec3 oc = ro - ce;
    float b = dot( oc, rd );
    float c = dot( oc, oc ) - ra*ra;
    float h = b*b - c;
    if( h<0.0 ) return vec2(-1.0); 
    h = sqrt( h );
    return vec2( -b-h, -b+h );
}
float plaIntersect( in vec3 ro, in vec3 rd, in vec4 p )
{
    return -(dot(ro,p.xyz)+p.w)/dot(rd,p.xyz);
}

vec3 getsky(vec3 rd)
{
	vec3 col = vec3(0.3,0.6,1); 
	vec3 sun = vec3(0.95, 0.9,1);
	sun*= max(0.0,pow(dot(rd,light),32));
	return clamp(sun+col,0,1);
	
	
	
}


void castRay(in vec3 ro,in vec3 rd, out float minr, out vec3 n ,out vec3 color, out int objnum)
{
	
	vec3 planeN = vec3(0,0,1);
	vec2 it = sphIntersect(ro,rd,sph,1.0);
	n = vec3(0,0,0);
	color = vec3(1,1,1);
	float ten = 1;
	minr = -1;
	objnum = -1;
	if(it.x <= 0) 
	{
		minr = -1;
	}
	else
	{
		minr = it.x;
		n = ro + rd*it.x-sph;
		color = vec3(pow(1,0.45),pow(0.2,0.45),pow(0.1,0.45));
		objnum = 1;
		/*if(plaIntersect(ro+rd*it.x,light,vec4(planeN,1)) > 0)
		{
			ten = 0.5;
		}*/
	}
	
	float itplane = boxIntersection(ro - vec3(0,0,-1.3),rd,vec3(100,100,0.2),planeN).x;
	if(itplane > 0 && (minr<=0 || (minr>0 && itplane < minr))) 
	{		
		minr = itplane;
		n = planeN;
		color = vec3(pow(0.2,0.45),pow(0.7,0.45),pow(0.2,0.45));
		objnum = 2;
		/*if(sphIntersect(ro+rd*itplane,light,sph,1.0).x > 0)
		{
			ten = 0.5;
		}*/
	}
	vec3 nBox;
	vec2 itBox = boxIntersection(ro - box,rd,vec3(1,1,1),nBox);
	
	if(itBox.x > 0 && (minr<=0 || (minr>0 && itBox.x < minr))) 
	{		
		minr = itBox.x;
		n = nBox;
		color = vec3(pow(0.2,0.45),pow(0.2,0.45),pow(0.8,0.45));
		objnum = 3;
		/*if(sphIntersect(ro+rd*itplane,light,sph,1.0).x > 0)
		{
			ten = 0.5;
		}*/
	}
	
	
	
	/*if(minr>=0)
	{
		
		float diffuse = max(0.0,dot(light,n))*0.5;
		float specular = pow(max(0.0,dot(reflect(rd,n),light)),16);
		return vec3((diffuse + specular+0.1)*color*ten);
	}
	else
	{
		return vec3(-1);
	}		*/
	return;
}


vec3 traceRay(in vec3 ro,in vec3 rd)
{
	float minr;
	vec3 color;
	vec3 n;
	int objnum;
	
	castRay(ro,rd,minr,n,color,objnum);
		
	if(minr>=0)
	{	
		float ten = 1;							
		if(objnum >0)
		{
			float minr2;
			vec3 color2;
			vec3 n2;
			int objnum2;			
			castRay(ro+rd*minr,light,minr2,n2,color2,objnum2);
			if(minr2 > 0 && objnum!=objnum2 && objnum2>0)
			{
				ten = 0.5;
			}						
		}						
		float diffuse = max(0.0,dot(light,n))*0.5;
		float specular = pow(max(0.0,dot(reflect(rd,n),light)),16);
		
		vec3 ret = vec3((diffuse+0.1)*color*ten);
		
		return ret;
		
		
	}
	else
	{
		return getsky(rd);
	}
	
}


vec3 RayTrace(in vec3 ro,in vec3 rd)
{
	float minr;
	vec3 color;
	vec3 n;
	int objnum;
	
	float minr2;
	vec3 color2;
	vec3 n2;
	int objnum2;
	
	
	castRay(ro,rd,minr,n,color,objnum);
	float coff = 1;
	vec3 coffcol = vec3(1,1,1);	
	vec3 ret = vec3(0,0,0);
	vec3 hui = vec3(0,0,0);
	if(minr>=0)
	{
		if(objnum > 0)
		{
			for(int i = 0;i<25;i++)
			{
				
				castRay(ro+rd*minr,reflect(rd,n),minr2,n2,color2,objnum2);
				coffcol.x *= 0.8;
				coffcol.y *= 0.8;
				coffcol.z *= 0.8;
				if(objnum2 > 0)
				{
					ro = ro+rd*minr;
					rd = reflect(rd,n);
					minr = minr2;
					n = n2;
					color = color2;
					objnum = objnum2;
					//ret = color;
					
				}
				else
				{
					i = 25;
					ret = getsky(reflect(rd,n)) * coffcol;
					
				}							
			}																	
		}
																
		return ret;
		
		
	}
	else
	{
		return getsky(rd);
	}
	
	
	
	
}



void main()
{
	vec2 uv = (gl_FragCoord.xy - resol/2)/resol.y;
	vec2 uvRes = hash22(uv + 1.0) * resol + resol;
	R_STATE.x = uint(u_seed1.x + uvRes.x);
	R_STATE.y = uint(u_seed1.y + uvRes.x);
	R_STATE.z = uint(u_seed2.x + uvRes.y);
	R_STATE.w = uint(u_seed2.y + uvRes.y);
	vec3 rayOrigin = pos;
	vec3 dir2 = normalize(dir);
	vec3 vX = normalize(cross(dir2,vec3(0,0,1)));
	vec3 vZ = normalize(cross(vX,dir2));
	vec3 rayDirection = normalize(dir2+vX*uv.x+vZ*uv.y);
	
	vec3 col = RayTrace(rayOrigin,rayDirection);
	
	
	
	fragColor = vec4(col,1);
	
	

}